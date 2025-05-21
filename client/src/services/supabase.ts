import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

/**
 * Upload an image file to the storage bucket and return its public URL.
 * Note: The bucket name must match exactly what's in your Supabase dashboard.
 */
export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<string> {
  // First, let's try to list all available buckets to debug
  try {
    console.log('Attempting to upload to storage...');
    
    // Check which buckets are available
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error(`Could not list buckets: ${listError.message}`);
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    // If no buckets are available, throw a more specific error
    if (!buckets || buckets.length === 0) {
      throw new Error('No storage buckets found. Please create a bucket in your Supabase dashboard.');
    }
    
    // Get the first available bucket name (as a fallback)
    const bucketName = buckets[0]?.name || 'avatars_bucket';
    console.log(`Using bucket: ${bucketName}`);
    
    // Attempt the upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${userId}/${file.name}`, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
      
    console.log('Upload successful!');
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
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