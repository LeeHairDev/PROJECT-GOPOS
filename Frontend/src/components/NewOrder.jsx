import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import EditCustomerModal from './modals/EditCustomerModal';
import ProductSelector from './ProductSelector';
import BarcodeScanner from './BarcodeScanner';
import useBarcodeScanner from '../hooks/useBarcodeScanner';

const NewOrder = ({ onProcessOrder }) => {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', debt: 0, allowDebt: true });
  const [discount, setDiscount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [isDebt, setIsDebt] = useState(false);
  const [debtAmount, setDebtAmount] = useState(0);
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm để tìm kiếm mã vạch
  const [scannerEnabled, setScannerEnabled] = useState(false); // ✨ State bật/tắt scanner - Mặc định: TẮT

  // Hook quét mã vạch
  const handleBarcodeScanned = async (barcode) => {
    try {
      // Tìm sản phẩm theo mã vạch hoặc SKU
      const product = allProducts.find(p => 
        p.barcode === barcode || 
        p.sku === barcode || 
        p._id === barcode
      );
      
      if (product) {
        addToCart(product);
      } else {
        // Nếu không tìm thấy, gọi API để tìm
        const res = await productService.getAllProducts(undefined, undefined, 1, 1000);
        const products = res.products || res;
        const found = products.find(p => 
          p.barcode === barcode || 
          p.sku === barcode || 
          p._id === barcode
        );
        if (found) {
          setAllProducts(products);
          addToCart(found);
        } else {
          alert(`Không tìm thấy sản phẩm với mã vạch: ${barcode}`);
        }
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      alert('Lỗi khi quét mã vạch');
    }
  };

  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner(
    handleBarcodeScanned,
    scannerEnabled
  );

  useEffect(() => {
    fetchCustomers();
    fetchAllProducts();
    setLoading(false);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F9' || e.code === 'F9') {
        e.preventDefault();
        handleCreateOrder();
      } else if (e.key === 'F8' || e.code === 'F8') {
        e.preventDefault();
        setCartItems([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setSelectedCustomerId('');
        setDiscount(0);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cartItems, customerInfo, discount, paymentMethod]);

  const fetchCustomers = async () => {
    try {
      const res = await customerService.getAllCustomers();
      setCustomers(res || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const addToCart = (product) => {
    if (product.status === 'inactive') {
      try { window.alert('Sản phẩm này đang bị tắt bán, không thể thêm vào đơn.'); } catch (e) {}
      return;
    }
    const existing = cartItems.find(item => item.product._id === product._id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product._id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const tax = (subtotal - discountAmount) * 0.1;
    return {
      subtotal,
      discountAmount,
      tax,
      total: subtotal - discountAmount + tax
    };
  };

  const totals = calculateTotals();

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      const payload = {
        items: cartItems.map(item => ({ product: item.product._id, quantity: item.quantity })),
        discount: (totals.discountAmount / 100),
        tax: totals.tax,
        paymentMethod,
        customerName: customerInfo.name || 'Khách lẻ',
        customerPhone: customerInfo.phone || '',
        notes: customerInfo.address || '',
        customerId: selectedCustomerId || null,
        isDebt: isDebt && debtAmount > 0,
        debtAmount: debtAmount || 0,
      };

      const res = await orderService.createOrder(payload);
      if (res && res.order) {
        setCartItems([]);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setSelectedCustomerId('');
        setDiscount(0);
        onProcessOrder?.();
      } else if (res && res.message) {
        console.error('Order error:', res.message);
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  const onCustomerSelect = (id) => {
    setSelectedCustomerId(id);
    const c = customers.find(x => x._id === id);
    if (c) {
      setCustomerInfo({ 
        name: c.name || '', 
        phone: c.phone || '', 
        address: c.address || '',
        debt: c.debt || 0,
        allowDebt: c.allowDebt === true || c.allowDebt === undefined  // Default true if not set
      });
    } else {
      // Khách lẻ
      setCustomerInfo({ name: '', phone: '', address: '', debt: 0, allowDebt: false });
    }
    setIsDebt(false);
    setDebtAmount(0);
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCustomerSave = async (updated) => {
    await customerService.updateCustomer(updated._id, updated);
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    await fetchCustomers();
    if (updated._id === selectedCustomerId) {
      setCustomerInfo({ name: updated.name, phone: updated.phone, address: updated.address });
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      {/* Barcode Scanner Indicator */}
      <BarcodeScanner isScanning={isScanning} barcodeBuffer={barcodeBuffer} onClose={clearBuffer} />
      
      {/* HEADER: Customer & Search */}
      <div className="bg-white border-b flex items-center justify-between px-6 py-4 gap-6">
        {/* Left: Customer Section */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          {/* Scanner Toggle Button */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
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

          <div className="flex items-center gap-3 min-w-max">
            <i className="fas fa-user text-gray-400 text-lg"></i>
            <select 
              value={selectedCustomerId}
              onChange={(e) => onCustomerSelect(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-56 bg-white"
            >
              <option value="">Khách lẻ</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 min-w-max">
            <i className="fas fa-phone text-gray-400 text-lg"></i>
            <input 
              type="text" 
              placeholder="Số điện thoại"
              value={customerInfo.phone || ''}
              onChange={() => {}}
              readOnly
              className="px-3 py-2 border rounded-lg text-sm w-40 bg-gray-50"
            />
          </div>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex gap-3 overflow-hidden p-3">
        
        {/* LEFT: Products Table (70%) */}
        <div className="flex-1 min-w-0 flex flex-col bg-white rounded-lg shadow overflow-hidden">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-blue-50 sticky top-0">
                <tr className="border-b-2 border-gray-300">
                  <th className="px-2 py-3 text-left font-semibold text-gray-700 w-10">STT</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-24">Tên sản phẩm</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-20">Số lượng</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 w-24">Đơn giá</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 w-20">Giảm giá</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 w-20">Tiền thuế</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 w-24">Thành tiền</th>
                  <th className="px-2 py-3 text-center font-semibold text-gray-700 w-8">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                      <i className="fas fa-inbox text-3xl mb-2 block"></i>
                      Chưa có sản phẩm trong đơn hàng
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, index) => (
                    <tr key={item.product._id} className="hover:bg-blue-50 border-b">
                      <td className="px-2 py-3 text-center text-gray-600 font-medium w-10">{index + 1}</td>
                      <td className="px-3 py-3 min-w-40">
                        <div className="font-medium text-gray-800 truncate">{item.product.name}</div>
                        {item.product.image && (
                          <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded mt-1" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-center w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1 border rounded text-center text-sm"
                        />
                      </td>
                      <td className="px-3 py-3 text-right font-medium w-24 whitespace-nowrap">{item.product.price?.toLocaleString()}đ</td>
                      <td className="px-3 py-3 text-right text-orange-600 font-medium w-20 whitespace-nowrap">0đ</td>
                      <td className="px-3 py-3 text-right text-blue-600 font-medium w-20 whitespace-nowrap">{((item.product.price * item.quantity) * 0.1)?.toLocaleString()}đ</td>
                      <td className="px-3 py-3 text-right font-bold text-green-600 w-24 whitespace-nowrap">{((item.product.price * item.quantity) * 1.1)?.toLocaleString()}đ</td>
                      <td className="px-2 py-3 text-center w-8">
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition"
                          title="Xóa sản phẩm"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Footer */}
          {cartItems.length > 0 && (
            <div className="bg-gray-50 border-t px-6 py-4">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng tiền hàng:</span>
                <span className="text-blue-600">{totals.subtotal?.toLocaleString()}đ</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Product Selector (30%) */}
        <div className="w-96 flex flex-col bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <ProductSelector onAddToCart={addToCart} loading={loading} />
        </div>
      </div>

      {/* BOTTOM: Payment Controls */}
      <div className="bg-white border-t px-6 py-4">
        {/* Top Row: Discount & Payment Method */}
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-6 flex-1">
            {/* Discount */}
            <div className="flex items-center gap-3 min-w-max">
              <i className="fas fa-percentage text-gray-400"></i>
              <label className="text-sm font-medium text-gray-700">Giảm giá %:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100))}
                className="w-20 px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-3 min-w-max">
              <i className="fas fa-wallet text-gray-400"></i>
              <label className="text-sm font-medium text-gray-700">Thanh toán:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="cash">💵 Tiền mặt</option>
                <option value="card">💳 Thẻ</option>
                <option value="bank_transfer">🏦 Chuyển khoản</option>
                <option value="other">📱 Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Debt Section */}
        {selectedCustomerId && customerInfo.allowDebt && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDebt}
                  onChange={(e) => {
                    setIsDebt(e.target.checked);
                    if (!e.target.checked) setDebtAmount(0);
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-orange-800">📝 Bán nợ cho khách hàng</span>
              </label>
              <span className="text-sm text-orange-700">
                Công nợ hiện tại: <span className="font-bold">{customerInfo.debt?.toLocaleString('vi-VN') || '0'} VND</span>
              </span>
            </div>

            {isDebt && (
              <div className="bg-white rounded p-3 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền nợ</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={totals.total}
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(Math.min(Math.max(parseFloat(e.target.value) || 0, 0), totals.total))}
                        placeholder="Nhập số tiền nợ"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => setDebtAmount(totals.total)}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded text-sm"
                        title="Nợ toàn bộ"
                      >
                        Tất cả
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thanh toán ngay</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border font-semibold text-green-600">
                      {(totals.total - debtAmount).toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-700">
                  <i className="fas fa-info-circle"></i>
                  <span>Tổng hóa đơn: {totals.total.toLocaleString('vi-VN')} VND | Nợ: {debtAmount.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Row: Action Buttons */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            {/* Note Field */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <i className="fas fa-pen text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Ghi chú" 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 min-w-max">
              <i className="fas fa-calendar text-gray-400"></i>
              <input 
                type="text" 
                value={new Date().toLocaleDateString('vi-VN')} 
                onChange={() => {}}
                readOnly
                className="px-3 py-2 border rounded-lg text-sm bg-gray-50 w-40"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => {
                setCartItems([]);
                setCustomerInfo({ name: '', phone: '', address: '' });
                setSelectedCustomerId('');
                setDiscount(0);
                setIsDebt(false);
                setDebtAmount(0);
              }}
              className="flex items-center gap-2 px-6 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold text-sm transition whitespace-nowrap"
            >
              <i className="fas fa-download"></i>
              Lưu đơn (F8)
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={cartItems.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold text-sm transition whitespace-nowrap"
            >
              <i className={`fas ${(isDebt || debtAmount > 0) && debtAmount > 0 ? 'fa-file-contract' : 'fa-camera'}`}></i>
              {(isDebt || debtAmount > 0) && debtAmount > 0 ? 'Ghi nợ (F9)' : 'Thanh toán (F9)'}
            </button>
          </div>
        </div>
      </div>

      <EditCustomerModal
        isOpen={isEditModalOpen}
        customer={editingCustomer}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleCustomerSave}
      />
    </div>
  );
};

export default NewOrder;
