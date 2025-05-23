import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedInitialData } from "./database";
import SQLiteStoreFactory from "connect-sqlite3";

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET environment variable is required!");
  console.error("💡 Please set SESSION_SECRET in your .env file or environment");
  console.error("💡 Example: SESSION_SECRET=your-super-secret-session-key-here");
  process.exit(1);
}

// Create SQLite session store
const SQLiteStore = SQLiteStoreFactory({ session });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware
app.use(session({
  store: new SQLiteStore({
    db: 'data/sessions.sqlite',
    dir: process.cwd(),
    table: 'sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed initial data after database is initialized
  await seedInitialData();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port from environment variable or fallback to 5001 (changed from 5000)
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
  
  // Try to start the server with the main port
  const startServer = (attemptPort: number) => {
    const serverInstance = server.listen({
      port: attemptPort,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`🚀 Deep Love Server is running on port ${attemptPort}`);
      log(`📊 API endpoints available at http://localhost:${attemptPort}/api`);
    });

    serverInstance.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // If the main port is in use, try an alternative port
        const alternativePort = attemptPort + 1;
        log(`⚠️  Port ${attemptPort} is in use, trying port ${alternativePort}...`);
        startServer(alternativePort);
      } else {
        log(`❌ Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });
  };
  
  startServer(port);
})();
