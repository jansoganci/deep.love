import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { UserCriteria } from "../types";
import { saveUserCriteria } from "../services/storage";
import { supabase } from "../services/supabase";
import { useToast } from "../hooks/use-toast";

const HOBBIES = [
  "Cooking",
  "Travel",
  "Photography",
  "Music",
  "Sports",
  "Reading",
  "Movies",
  "Hiking",
  "Gaming",
  "Art",
];

const GOALS = ["casual", "longTerm", "marriage", "friendship"];

const CriteriaScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [ageRange, setAgeRange] = useState<[number, number]>([18, 40]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [genderPreference, setGenderPreference] = useState<string>("any");
  const [distanceRadius, setDistanceRadius] = useState<number>(50);
  const [education, setEducation] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("");
  const [religion, setReligion] = useState<string>("none");
  const [ethnicity, setEthnicity] = useState<string>("none");
  const [height, setHeight] = useState<string>("");

  // Check if user already has criteria saved
  useEffect(() => {
    async function checkExistingCriteria() {
      try {
        setLoading(true);
        
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          setLocation('/login');
          return;
        }
        
        // Check if user already has criteria saved
        const { data, error } = await supabase
          .from('criteria')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 means no results found
            console.error("Error fetching criteria:", error);
            toast({
              title: "Error",
              description: "Failed to load your preferences. Please try again.",
              variant: "destructive"
            });
          }
          // No criteria found, show the form
          setLoading(false);
          return;
        }
        
        if (data) {
          console.log("Found existing criteria:", data);
          
          // User already has criteria saved, skip to matches screen
          // But first, save to local storage for backward compatibility
          const userCriteria: UserCriteria = {
            ageRange: [data.age_min, data.age_max],
            hobbies: data.hobbies || [],
            relationshipGoal: data.relationship_goal,
            genderPreference: data.gender || "any",
            distanceRadius: data.distance_km || 50,
            education: data.education || "",
            occupation: data.occupation || "",
            religion: data.religion || "none",
            ethnicity: data.ethnicity || "none",
            height: data.height_cm
          };
          
          saveUserCriteria(userCriteria);
          
          // Redirect to matches screen
          setLocation('/matches');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking existing criteria:", error);
        setLoading(false);
      }
    }
    
    checkExistingCriteria();
  }, [setLocation, toast]);

  const handleMinAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minAge = parseInt(e.target.value, 10);
    setAgeRange([minAge, Math.max(minAge, ageRange[1])]);
  };

  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxAge = parseInt(e.target.value, 10);
    setAgeRange([Math.min(ageRange[0], maxAge), maxAge]);
  };

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const selectGoal = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedHobbies.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one hobby",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGoal) {
      toast({
        title: "Missing Information",
        description: "Please select a relationship goal",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to save preferences",
          variant: "destructive"
        });
        setLocation('/login');
        return;
      }
      
      // Create criteria object for Supabase
      const criteriaData = {
        user_id: user.id,
        age_min: ageRange[0],
        age_max: ageRange[1],
        gender: genderPreference,
        distance_km: distanceRadius,
        education: education || null,
        occupation: occupation || null,
        religion: religion,
        ethnicity: ethnicity,
        hobbies: selectedHobbies,
        relationship_goal: selectedGoal,
        height_cm: height ? parseInt(height, 10) : null,
        updated_at: new Date().toISOString()
      };
      
      // Save to Supabase (upsert - insert if not exists, update if exists)
      const { error } = await supabase
        .from('criteria')
        .upsert(criteriaData);
      
      if (error) {
        console.error("Error saving criteria:", error);
        toast({
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Also save to local storage for backward compatibility
      const userCriteria: UserCriteria = {
        ageRange,
        hobbies: selectedHobbies,
        relationshipGoal: selectedGoal,
        genderPreference,
        distanceRadius,
        education,
        occupation,
        religion,
        ethnicity,
        height: height ? parseInt(height, 10) : undefined,
      };
      
      saveUserCriteria(userCriteria);
      
      toast({
        title: "Preferences Saved",
        description: "Your criteria have been saved successfully!"
      });
      
      // Navigate to matches screen
      setLocation("/matches");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Show loading spinner while checking for existing criteria
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">
        {t("criteria.title")}
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        {t("criteria.subtitle")}
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Gender Preference
          </label>
          <select
            value={genderPreference}
            onChange={(e) => setGenderPreference(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-800"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium mb-3">Age Range</label>
          <div className="mb-2">
            <span className="text-sm font-medium">
              {ageRange[0]} - {ageRange[1]}
            </span>
          </div>
          <input
            type="range"
            min="18"
            max="100"
            value={ageRange[0]}
            onChange={handleMinAgeChange}
            className="w-full mb-2"
          />
          <input
            type="range"
            min="18"
            max="100"
            value={ageRange[1]}
            onChange={handleMaxAgeChange}
            className="w-full"
          />
        </div>

        {/* Distance Radius */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Distance Radius (km): {distanceRadius}
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={distanceRadius}
            onChange={(e) => setDistanceRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Relationship Goals */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Relationship Goals
          </label>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                className={`text-sm border ${
                  selectedGoal === goal
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                } rounded-lg p-3`}
                onClick={() => selectGoal(goal)}
              >
                {t(`criteria.goals.${goal}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Hobbies & Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {HOBBIES.map((hobby) => (
              <button
                key={hobby}
                type="button"
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedHobbies.includes(hobby)
                    ? "bg-primary text-white border border-primary"
                    : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => toggleHobby(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium mb-1">Education</label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg dark:bg-gray-800"
          />
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg dark:bg-gray-800"
          />
        </div>

        {/* Religion */}
        <div>
          <label className="block text-sm font-medium mb-1">Religion</label>
          <select
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg dark:bg-gray-800"
          >
            <option value="none">None</option>
            <option value="christian">Christian</option>
            <option value="muslim">Muslim</option>
            <option value="jewish">Jewish</option>
            <option value="hindu">Hindu</option>
            <option value="buddhist">Buddhist</option>
            <option value="spiritual">Spiritual</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Ethnicity */}
        <div>
          <label className="block text-sm font-medium mb-1">Ethnicity</label>
          <select
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg dark:bg-gray-800"
          >
            <option value="none">None</option>
            <option value="asian">Asian</option>
            <option value="black">Black</option>
            <option value="hispanic">Hispanic</option>
            <option value="white">White</option>
            <option value="mixed">Mixed</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-1">Height (cm)</label>
          <input
            type="number"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition font-medium"
        >
          {t("criteria.findMatches")}
        </button>
      </form>
    </div>
  );
};

export default CriteriaScreen;
