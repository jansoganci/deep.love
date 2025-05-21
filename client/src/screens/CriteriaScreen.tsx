import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { UserCriteria } from "../types";
import { saveUserCriteria } from "../services/storage";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedHobbies.length === 0) {
      alert("Please select at least one hobby");
      return;
    }

    if (!selectedGoal) {
      alert("Please select a relationship goal");
      return;
    }

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
    setLocation("/matches");
  };

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
