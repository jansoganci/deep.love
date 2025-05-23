declare module 'better-sqlite3' {
  export interface Database {
    prepare: (sql: string) => Statement;
    exec: (sql: string) => void;
    transaction: <T>(fn: (data: T) => void) => (data: T) => void;
    pragma: (pragma: string, options?: { simple?: boolean }) => any;
    close: () => void;
  }

  export interface Statement {
    run: (...params: any[]) => { lastInsertRowid: number; changes: number };
    get: (...params: any[]) => any;
    all: (...params: any[]) => any[];
    iterate: (...params: any[]) => Iterable<any>;
  }

  export default function(filename: string, options?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: boolean | ((message?: any, ...additionalArgs: any[]) => void);
  }): Database;
}

declare module 'connect-sqlite3' {
  import session from 'express-session';
  
  export default function(options: {
    session: typeof session;
  }): {
    new(options: {
      db: string;
      dir?: string;
      table?: string;
    }): session.Store;
  };
} 