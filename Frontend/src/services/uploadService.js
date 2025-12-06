/**
 * Upload ảnh lên Cloudinary
 * Cần cấu hình VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET trong .env
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn(
    "⚠️ Cloudinary configuration missing. Please create .env file with:\n" +
      "VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name\n" +
      "VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset\n" +
      "See .env.example for more details"
  );
}

/**
 * Upload ảnh lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @param {string} folder - Folder trên Cloudinary (optional)
 * @returns {Promise<string>} URL của ảnh sau khi upload
 */
export const uploadImage = async (file, folder = "gopos") => {
  if (!file) throw new Error("Vui lòng chọn ảnh");

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary chưa được cấu hình. Vui lòng thiết lập .env file"
    );
  }

  // Kiểm tra kích thước (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ảnh quá lớn (max 5MB)");
  }

  // Kiểm tra định dạng
  if (!file.type.startsWith("image/")) {
    throw new Error("File phải là ảnh");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload ảnh thất bại");
    }

    const data = await response.json();
    return data.secure_url; // Trả về URL secure của ảnh
  } catch (err) {
    console.error("Upload error:", err);
    throw new Error("Lỗi upload ảnh: " + err.message);
  }
};

/**
 * Xóa ảnh từ Cloudinary (yêu cầu API key)
 * @param {string} publicId - Public ID của ảnh trên Cloudinary
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;

  // Lưu ý: Xóa từ client không an toàn, nên nên làm ở backend
  console.warn("Để xóa ảnh an toàn, hãy gọi API từ backend");
};
