import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

/**
 * Upload an image file to the storage bucket and return its public URL.
 */
export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<string> {
  const bucketName = "avatars";

  // Kullanıcı gerçekten login mi kontrol et
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("Kullanıcı login değil");
    throw new Error("You must be logged in to upload an avatar.");
  }

  try {
    console.log("Uploading to:", bucketName);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${userId}/${file.name}`, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log("Upload successful!");
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
  }
}

/**
 * Record a swipe action (`left` or `right`) between two users.
 */
export async function recordSwipe(
  fromId: string,
  toId: string,
  direction: "left" | "right",
): Promise<void> {
  const { error } = await supabase.from("swipes").insert({
    from_id: fromId,
    to_id: toId,
    direction,
  });

  if (error) throw error;
}
