import { useState } from 'react';
import { generateAndInsertFakeProfiles } from '../utils/generateFakeProfiles';
import { useToast } from '../hooks/use-toast';

const GenerateFakeProfiles = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateProfiles = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      toast({
        title: "Starting Generation",
        description: "Creating 20 fake profiles (10 female, 10 male)...",
      });
      
      const profileIds = await generateAndInsertFakeProfiles();
      
      toast({
        title: "Success!",
        description: `Created 20 fake profiles with proper UUIDs`,
      });
      
      console.log("Created profile IDs:", profileIds);
      
    } catch (error) {
      console.error("Error generating profiles:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate profiles",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleGenerateProfiles}
        disabled={isGenerating}
        className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          "Generate 20 Fake Profiles"
        )}
      </button>
    </div>
  );
};

export default GenerateFakeProfiles;