/**
 * Generate avatar URL - dùng ảnh mặc định kiểu Facebook
 * @param {string} avatarUrl - URL avatar nếu có
 * @returns {string} URL avatar
 */
export const getAvatarUrl = (avatarUrl) => {
  if (avatarUrl) return avatarUrl;

  // Fallback: placeholder giống Facebook (gray avatar)
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"%3E%3Crect fill="%23e4e6eb" width="150" height="150"/%3E%3Ccircle cx="75" cy="50" r="25" fill="%23bcc0c4"/%3E%3Cpath d="M30 140 Q30 100 75 100 Q120 100 120 140 Z" fill="%23bcc0c4"/%3E%3C/svg%3E';
};

/**
 * Get initials từ name
 */
export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
