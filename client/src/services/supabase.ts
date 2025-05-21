import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

/**
 * Upload an image file to the `avatars_bucket` storage bucket and return its public URL.
 */
export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('avatars_bucket')
    .upload(`${userId}/${file.name}`, file, { upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('avatars_bucket')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Record a swipe action (`left` or `right`) between two users.
 */
export async function recordSwipe(
  fromId: string,
  toId: string,
  direction: 'left' | 'right',
): Promise<void> {
  const { error } = await supabase.from('swipes').insert({
    from_id: fromId,
    to_id: toId,
    direction,
  });

  if (error) throw error;
}