// Frontend/src/services/userService.ts

const API_BASE_URL = 'http://localhost:5000/api/users'; // Địa chỉ API Backend

interface NewUserData {
    name: string;
    email: string;
}

export const createUser = async (userData: NewUserData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Có thể thêm Authorization header ở đây nếu cần
            },
            // Chuyển đối tượng JavaScript thành chuỗi JSON
            body: JSON.stringify(userData),
        });

        // Kiểm tra mã trạng thái HTTP
        if (!response.ok) {
            // Lấy thông báo lỗi từ Backend (nếu có)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo người dùng.');
        }

        // Trả về dữ liệu đã được tạo
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Lỗi gọi API:", error);
        throw error; // Ném lỗi để component UI có thể xử lý
    }
};