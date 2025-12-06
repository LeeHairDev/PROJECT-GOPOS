import React, { useState, useEffect } from 'react';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import { productService } from '../services/productService';

/**
 * BarcodeInputField Component
 * 
 * Component riêng CHỈ để quét mã vạch (không phải tìm kiếm thông thường)
 * Tách biệt hoàn toàn khỏi ô tìm kiếm bình thường
 * 
 * ✨ Có nút ON/OFF để bật/tắt chế độ quét mã vạch
 */
const BarcodeInputField = ({ 
  onBarcodeScanned,
  onNotFound,
  placeholder = '📱 Quét mã vạch sản phẩm...',
  defaultEnabled = true 
}) => {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(false); // ✨ State bật/tắt - Mặc định: TẮT
  const inputRef = React.useRef(null);

  useEffect(() => {
    fetchAllProducts();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const fetchAllProducts = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 1000);
      const products = res.products || res;
      setAllProducts(products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Xử lý khi quét mã vạch hoàn tất
  const handleBarcodeDetected = (barcode) => {
    const product = allProducts.find(p => 
      p.barcode === barcode || 
      p.sku === barcode
    );

    if (product) {
      // ✅ Tìm thấy sản phẩm
      onBarcodeScanned?.(product, barcode);
      setBarcodeValue('');
      // Focus lại để quét tiếp
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // ❌ Không tìm thấy
      onNotFound?.(barcode);
      setBarcodeValue('');
    }
  };

  // Hook quét mã vạch
  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner(
    handleBarcodeDetected,
    scannerEnabled
  );

  // Xử lý gõ thủ công và nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barcodeValue.trim()) {
        handleBarcodeDetected(barcodeValue);
      }
    }
  };

  const handleChange = (e) => {
    // Chỉ cho phép ký tự barcode hợp lệ
    const value = e.target.value;
    // Loại bỏ ký tự không phải số (barcode chỉ có số)
    const cleanValue = value.replace(/[^0-9a-zA-Z\-]/g, '');
    setBarcodeValue(cleanValue);
  };

  return (
    <div className="barcode-input-field">
      {/* Header với nút ON/OFF */}
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <i className="fas fa-barcode text-blue-500"></i>
          Quét Mã Vạch
        </label>
        <button
          onClick={() => setScannerEnabled(!scannerEnabled)}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
            scannerEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={scannerEnabled ? 'Tắt quét mã vạch' : 'Bật quét mã vạch'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              scannerEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Ô input riêng CHỈ để quét mã vạch */}
      <div className="relative mb-2">
        <div className="absolute left-3 top-3 text-blue-500">
          <i className="fas fa-barcode text-lg"></i>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={scannerEnabled ? placeholder : '🔒 Quét mã vạch đã tắt - Gõ tay để tìm kiếm'}
          value={barcodeValue || barcodeBuffer}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-12 py-2 border-2 border-blue-400 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition bg-blue-50"
          autoFocus
          disabled={isLoading}
        />

        {/* Indicator quét */}
        {isScanning && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="flex items-center gap-1 text-blue-600">
              <i className="fas fa-spinner fa-spin text-lg"></i>
              <span className="text-xs font-semibold">Quét...</span>
            </div>
          </div>
        )}

        {/* Nút xóa */}
        {barcodeValue && !isScanning && (
          <button
            onClick={() => {
              setBarcodeValue('');
              clearBuffer();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        )}
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          <i className={`fas fa-info-circle ${scannerEnabled ? 'text-green-500' : 'text-gray-400'}`}></i>
          {' '}
          {scannerEnabled 
            ? 'Quét hoặc gõ barcode rồi Enter' 
            : 'Quét tắt - chỉ dùng gõ tay'}
        </span>
        {isLoading && (
          <span className="text-xs text-blue-600 animate-pulse">
            <i className="fas fa-spinner fa-spin mr-1"></i>Đang tải...
          </span>
        )}
      </div>
    </div>
  );
};

export default BarcodeInputField;
