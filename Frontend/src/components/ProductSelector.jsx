import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { warehouseService } from '../services/warehouseService';

const ProductSelector = ({ onAddToCart, loading }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(loading);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    // Focus search input khi component mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 150);
      if (res && res.products) {
        setAvailableProducts(res.products);
      } else if (Array.isArray(res)) {
        setAvailableProducts(res);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setIsLoading(false);
  };

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getAllWarehouses();
      if (res && res.warehouses) setWarehouses(res.warehouses);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const filteredProducts = availableProducts
    .filter(p => {
      if (selectedWarehouse) {
        return p.warehouse && (p.warehouse._id === selectedWarehouse || p.warehouse === selectedWarehouse);
      }
      // If there are warehouses marked as selling, only show products that belong
      // to one of those selling warehouses. This hides products moved to the
      // "Kho tạm dừng bán" (or any non-selling warehouse) by default.
      const selling = warehouses.filter(w => w.isSellingWarehouse);
      if (selling.length > 0) {
        const sellingIds = new Set(selling.map(w => w._id));
        return p.warehouse && sellingIds.has(p.warehouse._id || p.warehouse);
      }
      return true;
    })
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => p.status !== 'inactive'); // hide products marked as not for sale

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center gap-2">
        <i className="fas fa-box text-sm"></i>
        <h3 className="font-bold text-sm">Sản Phẩm</h3>
      </div>

      {/* Search bar */}
      <div className="border-b p-2 bg-white">
        <div className="relative">
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm sản phẩm (F1)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 border-2 border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="ml-2 px-2 py-1 border rounded text-xs"
              title="Chọn kho để lấy hàng"
            >
              <option value="">-- Tất cả kho --</option>
              {
                // Only show warehouses marked as selling. If none marked, show all.
                (() => {
                  const selling = warehouses.filter(w => w.isSellingWarehouse);
                  const list = selling.length > 0 ? selling : warehouses;
                  return list.map(w => (<option key={w._id} value={w._id}>{w.name}</option>));
                })()
              }
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid (show 6 items visible, rest scroll) */}
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-1.5 bg-gray-100 pr-2">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-2xl mb-2"></i>
            <p className="text-sm">Không có sản phẩm</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <button
              key={product._id}
              onClick={() => {
                if (product.status === 'inactive') {
                  try { window.alert('Sản phẩm này đã được tắt bán.'); } catch (e) {}
                  return;
                }
                onAddToCart(product)
              }}
              disabled={product.quantity === 0}
              className="relative group bg-white border border-gray-200 rounded p-1.5 hover:border-blue-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left overflow-hidden h-48 flex flex-col"
              title={product.name}
            >
              {/* Stock indicator */}
              <div className={`absolute top-1 right-1 z-10 w-2.5 h-2.5 rounded-full ${product.quantity > 10 ? 'bg-green-500' : product.quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

              {/* Product Image */}
              <div className="mb-1 h-16 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300 overflow-hidden relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <i className="fas fa-box text-lg mb-0.5"></i>
                    <span className="text-xs">Không ảnh</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-gray-900 line-clamp-2 leading-3 text-xs h-6">{product.name}</div>
                
                {/* Price */}
                <div className="bg-blue-50 p-0.5 rounded text-center mb-0.5">
                  <p className="text-gray-600 text-xs">💰 Giá</p>
                  <p className="text-blue-600 font-bold text-xs">
                    {product.price ? `${(product.price || 0).toLocaleString()}đ` : '--'}
                  </p>
                </div>
                
                {/* Stock */}
                <div className={`bg-green-50 p-0.5 rounded text-center border ${
                  product.quantity > 10 ? 'border-green-500' : 
                  product.quantity > 0 ? 'border-yellow-500' : 
                  'border-red-500'
                }`}>
                  <p className="text-gray-600 text-xs">📦 Tồn kho</p>
                  <p className={`font-bold text-xs ${
                    product.quantity > 10 ? 'text-green-700' : 
                    product.quantity > 0 ? 'text-yellow-700' : 
                    'text-red-700'
                  }`}>
                    {product.quantity || 0}
                  </p>
                </div>
              </div>

              {/* Quick add overlay - show on hover */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 rounded transition flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <i className="fas fa-plus text-blue-600 text-xl drop-shadow-lg"></i>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-600">Tìm thấy</div>
            <div className="text-sm font-bold text-blue-600">{filteredProducts.length}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Tổng kho</div>
            <div className="text-sm font-bold text-green-600">{availableProducts.reduce((sum, p) => sum + p.quantity, 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
