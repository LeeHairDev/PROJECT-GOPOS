import React, { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { exportProductsToExcel } from '../utils/excelExport'
import AddProductModal from './modals/AddProductModal'
import EditProductModal from './modals/EditProductModal'
import BarcodeScanner from './BarcodeScanner'
import useBarcodeScanner from '../hooks/useBarcodeScanner'

const Products = ({ onAddProduct }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' hoặc 'table'
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm để tìm kiếm mã vạch
  const [scannerEnabled, setScannerEnabled] = useState(false); // ✨ State bật/tắt scanner - Mặc định: TẮT
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriceRange, setFilterPriceRange] = useState('all')
  const [filterStock, setFilterStock] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [categories, setCategories] = useState([])
  const limit = 10

  // Hook quét mã vạch - để tìm sản phẩm theo mã vạch để sửa
  const handleBarcodeScanned = (barcode) => {
    const product = allProducts.find(p => 
      p.barcode === barcode || 
      p.sku === barcode || 
      p._id === barcode
    );
    
    if (product) {
      handleEditClick(product);
    } else {
      alert(`Không tìm thấy sản phẩm với mã vạch: ${barcode}`);
    }
  };

  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner(
    handleBarcodeScanned,
    scannerEnabled
  );

  useEffect(() => {
    fetchProducts();
    fetchAllProducts();
    loadCategories();
  }, [page, searchTerm, filterCategory, filterPriceRange, filterStock, sortBy]);

  // Reset page when search term changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 1000);
      if (res && res.products) {
        setAllProducts(res.products);
      } else if (Array.isArray(res)) {
        setAllProducts(res);
      }
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAllProducts(undefined, undefined, page, limit, searchTerm);
      if (res && res.products) {
        setProducts(res.products);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const res = await productService.deleteProduct(id)
        if (res && res.message) {
          alert('Xóa sản phẩm thành công')
          fetchProducts()
        }
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('Lỗi khi xóa sản phẩm')
      }
    }
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  

  const handleEditSave = () => {
    fetchProducts()
    if (onAddProduct) onAddProduct()
  }

  

  const handleExportExcel = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 10000);
      if (res && res.products) {
        exportProductsToExcel(res.products);
      }
    } catch (err) {
      console.error('Error exporting products:', err);
      alert('Lỗi khi xuất Excel');
    }
  };

  const getStockBadge = (stock) => {
    if (stock > 50) return 'bg-green-100 text-green-800';
    if (stock > 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const isOutOfStock = (product) => {
    return product.warehouse && 
           (product.warehouse.name?.toLowerCase().includes('tạm dừng') ||
            product.warehouse.name?.toLowerCase().includes('không bán') ||
            product.warehouse.name?.toLowerCase().includes('out of stock'))
  };

  const applyFilters = (productsToFilter) => {
    let filtered = productsToFilter;

    // Lọc theo danh mục
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category?._id === filterCategory);
    }

    // Lọc theo khoảng giá
    if (filterPriceRange !== 'all') {
      const [minPrice, maxPrice] = filterPriceRange.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }

    // Lọc theo tồn kho
    if (filterStock !== 'all') {
      if (filterStock === 'outofstock') {
        filtered = filtered.filter(p => p.quantity === 0);
      } else if (filterStock === 'low') {
        filtered = filtered.filter(p => p.quantity > 0 && p.quantity <= 10);
      } else if (filterStock === 'medium') {
        filtered = filtered.filter(p => p.quantity > 10 && p.quantity <= 50);
      } else if (filterStock === 'high') {
        filtered = filtered.filter(p => p.quantity > 50);
      }
    }

    // Sắp xếp
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock-asc') {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === 'stock-desc') {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    return filtered;
  };

  const getFilteredProductsStats = () => {
    const filtered = applyFilters(products);
    return {
      total: filtered.length,
      outOfStock: filtered.filter(p => p.quantity === 0).length,
      lowStock: filtered.filter(p => p.quantity > 0 && p.quantity <= 10).length,
      totalValue: filtered.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    };
  };

  const maxPages = Math.ceil(total / limit);

  return (
    <div className="relative">
      {/* Barcode Scanner Indicator */}
      <BarcodeScanner isScanning={isScanning} barcodeBuffer={barcodeBuffer} onClose={clearBuffer} />

      <div className="bg-white rounded-lg shadow p-6">
        {/* Advanced Filter Toggle */}
       

        {/* Advanced Filter Panel */}
        {showAdvancedFilter && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Danh mục */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-tag mr-2"></i>Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Khoảng giá */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-money-bill-wave mr-2"></i>Khoảng giá
              </label>
              <select
                value={filterPriceRange}
                onChange={(e) => { setFilterPriceRange(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả giá</option>
                <option value="0-100000">Dưới 100K</option>
                <option value="100000-500000">100K - 500K</option>
                <option value="500000-1000000">500K - 1M</option>
                <option value="1000000-5000000">1M - 5M</option>
                <option value="5000000-999999999">Trên 5M</option>
              </select>
            </div>

            {/* Tồn kho */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-box mr-2"></i>Tồn kho
              </label>
              <select
                value={filterStock}
                onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả</option>
                <option value="outofstock">Hết hàng (0)</option>
                <option value="low">Ít (1-10)</option>
                <option value="medium">Vừa (11-50)</option>
                <option value="high">Nhiều (50+)</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-sort mr-2"></i>Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Theo tên A-Z</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="stock-asc">Tồn kho: Thấp → Cao</option>
                <option value="stock-desc">Tồn kho: Cao → Thấp</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Stats */}
        {(filterCategory !== 'all' || filterPriceRange !== 'all' || filterStock !== 'all') && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const stats = getFilteredProductsStats();
              return (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-semibold">Tổng sản phẩm</div>
                    <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-semibold">Hết hàng</div>
                    <div className="text-xl font-bold text-red-700">{stats.outOfStock}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-xs text-yellow-600 font-semibold">Ít hàng</div>
                    <div className="text-xl font-bold text-yellow-700">{stats.lowStock}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-semibold">Giá trị kho</div>
                    <div className="text-lg font-bold text-green-700">{(stats.totalValue / 1000000).toFixed(1)}M</div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0 gap-3">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="🔍 Tìm theo tên, SKU, mã vạch..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
           <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition"
          >
            <i className={`fas fa-sliders-h ${showAdvancedFilter ? 'rotate-180' : ''}`}></i>
            {showAdvancedFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc nâng cao'}
          </button>
          {(filterCategory !== 'all' || filterPriceRange !== 'all' || filterStock !== 'all') && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Đang lọc dữ liệu
            </span>
          )}
        </div>
           <div className="flex space-x-3 items-center">
          {/* Scanner Toggle Button */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
            <i className="fas fa-barcode text-blue-500 text-lg"></i>
            <span className="text-sm font-semibold text-gray-700">Quét:</span>
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

          <button 
            onClick={handleExportExcel}
            className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
          >
            <i className="fas fa-download mr-2"></i> Xuất Excel
          </button>
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              title="Xem dạng lưới"
            >
              <i className="fas fa-th"></i>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              title="Xem dạng bảng"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i> Thêm sản phẩm
          </button>
        </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          <>
            {applyFilters(products).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-4"></i>
                <p>Không có sản phẩm phù hợp với tiêu chí lọc</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  // GRID VIEW - Hiển thị ảnh sản phẩm
                  // Increased max height so the section is longer on screen
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[calc(100vh-305px)] overflow-y-auto rounded-lg pr-2">
                    {applyFilters(products).map((product) => (
                      <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                        {/* Image Container */}
                        <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                              <i className="fas fa-image text-4xl mb-2"></i>
                              <span className="text-sm">Không có ảnh</span>
                            </div>
                          )}
                          {/* Stock Badge */}
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            {isOutOfStock(product) && (
                              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <i className="fas fa-ban"></i> Tạm dừng
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(product.quantity)}`}>
                              {product.quantity} kho
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-800 truncate mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-500 mb-3 h-16 overflow-hidden">{product.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-blue-600">{product.price?.toLocaleString()} VND</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{product.category?.name || 'N/A'}</span>
                          </div>
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClick(product)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition"
                            >
                              <i className="fas fa-edit mr-1"></i> Sửa
                            </button>
                            <button 
                              onClick={() => deleteProduct(product._id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-medium transition"
                            >
                              <i className="fas fa-trash mr-1"></i> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // TABLE VIEW - Hiển thị bảng chi tiết
                  <div className="overflow-x-auto rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applyFilters(products).map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                  <i className="fas fa-image text-sm"></i>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium">{product.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{product.price?.toLocaleString()} VND</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isOutOfStock(product) && (
                                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <i className="fas fa-ban"></i> Tạm dừng
                                  </span>
                                )}
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockBadge(product.quantity)}`}>
                                  {product.quantity}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {product.status || 'active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {/* warehouse action removed per request */}
                                <button 
                                  onClick={() => handleEditClick(product)}
                                  className="text-blue-600 hover:text-blue-900" 
                                  title="Sửa"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button onClick={() => deleteProduct(product._id)} className="text-red-600 hover:text-red-900" title="Xóa">
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Hiển thị <span className="font-medium">{applyFilters(products).length}</span> kết quả</span>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, maxPages) }, (_, i) => (
                      <button 
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded-lg ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <EditProductModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        product={selectedProduct}
      />
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={() => {
          setShowAddModal(false)
          fetchProducts()
          if (onAddProduct) onAddProduct()
        }}
      />
      {/* ProductStockPanel removed from Products management UI */}
    </div>
  )
}

export default Products
