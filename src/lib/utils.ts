/**
 * LEE LAGOS ASSET HELPER
 * Generates public URLs for files stored in Supabase
 */
export function getAssetUrl(path: string, bucket: string = 'brands') {
  // Replace this with your actual Supabase Project URL from your dashboard
  const SUPABASE_PROJECT_URL = 'https://aruijpdlyxhcmrkgwioo.supabase.co';
  
  if (!path) return '';
  
  // Returns the clean public path to your image
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${path}`;
}