import * as XLSX from "xlsx";

// Export Products to Excel
export const exportProductsToExcel = (
  products,
  filename = "Danh_sach_san_pham.xlsx"
) => {
  try {
    // Prepare data for Excel
    const data = products.map((product, index) => ({
      STT: index + 1,
      "Tên sản phẩm": product.name || "",
      Giá: product.price || 0,
      "Tồn kho": product.quantity || 0,
      "Danh mục": product.category?.name || "",
      "Mô tả": product.description || "",
      "Ngày tạo": new Date(product.createdAt).toLocaleDateString("vi-VN"),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // STT
      { wch: 20 }, // Tên sản phẩm
      { wch: 12 }, // Giá
      { wch: 12 }, // Tồn kho
      { wch: 15 }, // Danh mục
      { wch: 30 }, // Mô tả
      { wch: 15 }, // Ngày tạo
    ];

    // Write file
    XLSX.writeFile(wb, filename);
    alert("Xuất file Excel thành công!");
  } catch (error) {
    console.error("Error exporting products:", error);
    alert("Lỗi khi xuất file Excel");
  }
};

// Export Orders to Excel
export const exportOrdersToExcel = (
  orders,
  filename = "Danh_sach_hoa_don.xlsx"
) => {
  try {
    // Prepare data for Excel
    const data = orders.map((order, index) => ({
      STT: index + 1,
      "Mã hóa đơn": order.orderNumber || "",
      "Khách hàng": order.customerInfo?.name || order.customerName || "",
      "Điện thoại": order.customerInfo?.phone || "",
      "Địa chỉ": order.customerInfo?.address || "",
      "Số lượng sản phẩm": (order.items && order.items.length) || 0,
      "Tổng tiền": order.finalTotal || 0,
      "Giảm giá": order.discount || 0,
      Thuế: order.tax || 0,
      "Trạng thái": order.status || "",
      "Ngày tạo": new Date(order.createdAt).toLocaleDateString("vi-VN"),
      "Ghi chú": order.notes || "",
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hóa đơn");

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // STT
      { wch: 15 }, // Mã hóa đơn
      { wch: 20 }, // Khách hàng
      { wch: 12 }, // Điện thoại
      { wch: 25 }, // Địa chỉ
      { wch: 10 }, // Số lượng sản phẩm
      { wch: 12 }, // Tổng tiền
      { wch: 10 }, // Giảm giá
      { wch: 10 }, // Thuế
      { wch: 12 }, // Trạng thái
      { wch: 15 }, // Ngày tạo
      { wch: 20 }, // Ghi chú
    ];

    // Write file
    XLSX.writeFile(wb, filename);
    alert("Xuất file Excel thành công!");
  } catch (error) {
    console.error("Error exporting orders:", error);
    alert("Lỗi khi xuất file Excel");
  }
};

// Export with custom date range
export const exportWithDateRange = (
  data,
  startDate,
  endDate,
  filename,
  type = "orders"
) => {
  try {
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });

    if (type === "orders") {
      exportOrdersToExcel(filtered, filename);
    } else if (type === "products") {
      exportProductsToExcel(filtered, filename);
    }
  } catch (error) {
    console.error("Error exporting with date range:", error);
    alert("Lỗi khi xuất file Excel");
  }
};
