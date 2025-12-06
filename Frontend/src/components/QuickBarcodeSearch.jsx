import React, { useState, useEffect } from 'react';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import { productService } from '../services/productService';

/**
 * Component tìm kiếm và thêm sản phẩm nhanh từ mã vạch
 * Sử dụng cho: Bán hàng, Nhập kho, Sửa sản phẩm
 */
export const QuickBarcodeSearch = ({ 
  onProductFound, 
  onProductNotFound, 
  placeholder = 'Quét mã vạch hoặc nhập SKU...',
  autoFocus = true 
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = React.useRef(null);

  useEffect(() => {
    fetchAllProducts();
    if (autoFocus && inputRef.current) {
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
  const handleBarcodeScanned = (barcode) => {
    searchProduct(barcode);
  };

  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner(
    handleBarcodeScanned,
    true
  );

  const searchProduct = (query) => {
    if (!query.trim()) return;

    const product = allProducts.find(p => 
      p.barcode?.toLowerCase() === query.toLowerCase() || 
      p.sku?.toLowerCase() === query.toLowerCase() ||
      p._id === query
    );

    if (product) {
      onProductFound?.(product);
      setSearchInput('');
      clearBuffer();
      // Focus lại input để tiếp tục quét
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onProductNotFound?.(query);
      setSearchInput('');
    }
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchProduct(searchInput);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchInput || barcodeBuffer}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          autoFocus={autoFocus}
        />
        <i className="fas fa-barcode absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-lg"></i>
        
        {/* Status indicator */}
        {isScanning && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-500 animate-pulse">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        )}
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        💡 Quét mã vạch hoặc nhập SKU/Mã sản phẩm rồi nhấn Enter
      </p>
    </div>
  );
};

export default QuickBarcodeSearch;
