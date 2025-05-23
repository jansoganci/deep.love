-- Create a function to insert a profile
CREATE OR REPLACE FUNCTION insert_profile(
  profile_id UUID,
  name TEXT,
  age_val INTEGER,
  occupation_val TEXT,
  bio_val TEXT,
  avatar TEXT,
  interests_val TEXT[],
  relationship_goal_val TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Insert or update the profile
  INSERT INTO profiles (
    id, 
    display_name, 
    age, 
    occupation, 
    bio, 
    avatar_url, 
    interests, 
    relationship_goal
  ) 
  VALUES (
    profile_id, 
    name, 
    age_val, 
    occupation_val, 
    bio_val, 
    avatar, 
    interests_val, 
    relationship_goal_val
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    display_name = EXCLUDED.display_name,
    age = EXCLUDED.age,
    occupation = EXCLUDED.occupation,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url,
    interests = EXCLUDED.interests,
    relationship_goal = EXCLUDED.relationship_goal;
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 