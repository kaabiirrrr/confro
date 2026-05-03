/**
 * Clean and sanitize image URLs to handle broken dummy data.
 * Replaces localhost URLs (from previous dev sessions) with stable fallbacks.
 */
export const cleanImageUrl = (url, name = 'User') => {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38BDF8&color=fff&bold=true&length=1`;

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38BDF8&color=fff&bold=true&length=1`;

  // Detect broken localhost URLs from any port or 127.0.0.1
  const isDirty = url.includes('localhost:') || url.includes('127.0.0.1:');

  if (isDirty) {
    // SMART REROUTE: Instead of failing, try to find it on our current origin
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return `/${fileName}`;
  }

  // SUPABASE BUCKET REROUTE: (Disabled as it was breaking valid URLs)
  // if (url.includes('supabase.co/storage/v1/object/public/')) {
  //   if (url.includes('/avatars/') || url.includes('/avatars1/')) {
  //     return url.replace(/\/avatars\d?\//, '/profilephotos/');
  //   }
  // }

  return url;
};

export const getAvatarFallback = (name = 'User') => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};
