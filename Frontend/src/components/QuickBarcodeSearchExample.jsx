import React, { useState } from 'react';
import QuickBarcodeSearch from './QuickBarcodeSearch';

/**
 * Example: Cách sử dụng component QuickBarcodeSearch
 * 
 * Component này có thể được sử dụng trong:
 * - Tạo đơn hàng mới (thêm sản phẩm)
 * - Nhập hàng (tìm sản phẩm cần nhập)
 * - Sửa sản phẩm (tìm sản phẩm cần sửa)
 * - Hoặc bất kỳ nơi nào cần tìm sản phẩm nhanh chóng
 */
const QuickBarcodeSearchExample = () => {
  const [foundProduct, setFoundProduct] = useState(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState('');
  const [products, setProducts] = useState([]);

  const handleProductFound = (product) => {
    console.log('✅ Sản phẩm tìm thấy:', product);
    setFoundProduct(product);
    setNotFoundBarcode('');

    // Thêm sản phẩm vào danh sách (tuỳ chỉnh theo nhu cầu)
    setProducts([...products, product]);

    // Hoặc gọi API để xử lý sản phẩm
    // addToCart(product);
    // importProduct(product);
    // openEditModal(product);
  };

  const handleProductNotFound = (barcode) => {
    console.warn('❌ Không tìm thấy mã vạch:', barcode);
    setFoundProduct(null);
    setNotFoundBarcode(barcode);
    alert(`Không tìm thấy sản phẩm với mã: ${barcode}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔍 Ví Dụ: Quét Mã Vạch Nhanh</h1>
        <p className="text-gray-600 mb-6">
          Ví dụ về cách sử dụng component QuickBarcodeSearch
        </p>

        {/* Barcode Search Component */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Input Quét Mã Vạch</h2>
          <QuickBarcodeSearch
            onProductFound={handleProductFound}
            onProductNotFound={handleProductNotFound}
            placeholder="📦 Quét mã vạch sản phẩm..."
            autoFocus={true}
          />
          <p className="text-sm text-gray-500 mt-3">
            💡 Thử quét một sản phẩm hoặc gõ SKU rồi nhấn Enter
          </p>
        </div>

        {/* Sản phẩm tìm thấy */}
        {foundProduct && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Sản Phẩm Tìm Thấy</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Tên:</span> {foundProduct.name}
              </div>
              <div>
                <span className="font-semibold">Giá:</span> {foundProduct.price?.toLocaleString()} đ
              </div>
              <div>
                <span className="font-semibold">SKU:</span> {foundProduct.sku || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Mã vạch:</span> {foundProduct.barcode || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Tồn kho:</span> {foundProduct.quantity} cái
              </div>
              <div>
                <span className="font-semibold">Loại:</span> {foundProduct.category?.name || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Mã vạch không tìm thấy */}
        {notFoundBarcode && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Không Tìm Thấy</h3>
            <p className="text-red-700">
              Mã vạch/SKU: <span className="font-mono bg-red-100 px-2 py-1 rounded">{notFoundBarcode}</span>
            </p>
            <p className="text-sm text-red-600 mt-2">
              Vui lòng kiểm tra lại mã vạch hoặc cập nhật sản phẩm vào hệ thống
            </p>
          </div>
        )}

        {/* Danh sách sản phẩm đã quét */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              📋 Danh Sách Sản Phẩm Đã Quét ({products.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-blue-50">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">STT</th>
                    <th className="px-3 py-2 text-left">Tên Sản Phẩm</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-right">Giá</th>
                    <th className="px-3 py-2 text-right">Tồn Kho</th>
                    <th className="px-3 py-2 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr key={product._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{product.name}</td>
                      <td className="px-3 py-2 text-gray-600">{product.sku || 'N/A'}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {product.price?.toLocaleString()} đ
                      </td>
                      <td className="px-3 py-2 text-right">{product.quantity}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setProducts(products.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setProducts([])}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa Tất Cả
              </button>
              <button
                onClick={() => alert(`Sẽ lưu ${products.length} sản phẩm`)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                💾 Lưu ({products.length})
              </button>
            </div>
          </div>
        )}

        {/* Hướng dẫn sử dụng */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">📖 Hướng Dẫn Sử Dụng</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Quét mã vạch hoặc gõ SKU sản phẩm</li>
            <li>✅ Nhấn Enter hoặc đợi scanner gửi Enter</li>
            <li>✅ Sản phẩm sẽ được thêm vào danh sách</li>
            <li>✅ Tiếp tục quét sản phẩm khác</li>
            <li>✅ Nhấn "Lưu" khi hoàn tất</li>
          </ul>
        </div>

        {/* Import Example */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mt-6 overflow-x-auto">
          <h4 className="font-semibold mb-2">📝 Ví Dụ Code:</h4>
          <pre className="text-xs">{`import QuickBarcodeSearch from './QuickBarcodeSearch';

// Trong component của bạn:
const handleProductFound = (product) => {
  console.log('Sản phẩm tìm thấy:', product);
  addToCart(product); // Thêm vào giỏ hàng
};

const handleProductNotFound = (barcode) => {
  alert(\`Không tìm thấy: \${barcode}\`);
};

// JSX:
<QuickBarcodeSearch
  onProductFound={handleProductFound}
  onProductNotFound={handleProductNotFound}
  placeholder="Quét mã vạch..."
  autoFocus={true}
/>`}</pre>
        </div>
      </div>
    </div>
  );
};

export default QuickBarcodeSearchExample;
