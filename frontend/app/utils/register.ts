// Base64 grows ~33%, so this stays under the backend's 1.5 MB data-URL limit
export const MAX_PICTURE_BYTES = 1024 * 1024;
export const MIN_PASSWORD_LENGTH = 6;

export const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Returns an error message, or null when the form can be submitted
export const validateRegistration = (
  username: string,
  password: string,
  picture?: { size: number } | null,
): string | null => {
  if (!username || !password) return "Both fields are required.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (picture && picture.size > MAX_PICTURE_BYTES) {
    return "Profile picture must be smaller than 1 MB.";
  }
  return null;
};
