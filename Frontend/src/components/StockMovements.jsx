import React, { useEffect, useState } from 'react';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import EditCustomerModal from './modals/EditCustomerModal';
import BarcodeScanner from './BarcodeScanner';
import useBarcodeScanner from '../hooks/useBarcodeScanner';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ product: '', type: 'in', quantity: 1, reference: '', date: '', customer: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(false); // ✨ State bật/tắt scanner - Mặc định: TẮT
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm

  // Hook quét mã vạch - để chọn sản phẩm bằng barcode
  const handleBarcodeScanned = (barcode) => {
    const product = allProducts.find(p => 
      p.barcode === barcode || 
      p.sku === barcode || 
      p._id === barcode
    );
    
    if (product) {
      setForm({ ...form, product: product._id });
    } else {
      alert(`Không tìm thấy sản phẩm với mã vạch: ${barcode}`);
    }
  };

  const { barcodeBuffer, isScanning, clearBuffer } = useBarcodeScanner(
    handleBarcodeScanned,
    scannerEnabled
  );

  const load = async () => {
    const res = await stockService.getMovements();
    setMovements(res || []);
  };

  const loadCustomers = async () => {
    try {
      const res = await customerService.getAllCustomers();
      setCustomers(res || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadProducts = async () => {
    const res = await productService.getAllProducts();
    // productService returns paginated object in some implementations; try to normalize
    const list = Array.isArray(res) ? res : (res.items || res.data || res.docs || res.products || []);
    setProducts(list);
    setAllProducts(list); // Lưu tất cả sản phẩm cho quét mã vạch
  };

  useEffect(() => {
    load();
    loadProducts();
    loadCustomers();
  }, []);

  // filtered customers by movement type: for 'in' show suppliers/both, for 'out' show customers/both
  const filteredCustomers = customers.filter(c => {
    if (!c || !c.type) return true;
    if (form.type === 'in') return c.type === 'supplier' || c.type === 'both';
    if (form.type === 'out') return c.type === 'customer' || c.type === 'both';
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await stockService.createMovement(form);
    setForm({ product: '', type: 'in', quantity: 1, reference: '', date: '', customer: '' });
    load();
    loadProducts();
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCustomerSave = async (updated) => {
    await customerService.updateCustomer(updated._id, updated);
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    await loadCustomers();
    if (form.customer === updated._id) setForm({ ...form, customer: updated._id });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa movement?')) return;
    await stockService.deleteMovement(id);
    load();
    loadProducts();
  };

  return (
    <div className="p-4">
      {/* Barcode Scanner Indicator */}
      <BarcodeScanner isScanning={isScanning} barcodeBuffer={barcodeBuffer} onClose={clearBuffer} />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý Xuất/Nhập Kho</h2>
        
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
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-4 gap-2">
          <select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="p-2 border">
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-2 border">
            <option value="in">Nhập</option>
            <option value="out">Xuất</option>
          </select>

          <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="p-2 border" />

          <input placeholder="Tham chiếu" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="p-2 border" />
          <div className="p-2 border">
              <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="w-full">
                <option value="">-- {form.type === 'in' ? 'Nhà cung cấp (tùy chọn)' : 'Khách hàng (tùy chọn)'} --</option>
                {filteredCustomers.map(c => <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
              </select>
            {form.customer && <div className="mt-2"><button type="button" onClick={() => openEditCustomer(customers.find(c => c._id === form.customer))} className="text-blue-600 hover:text-blue-900" title="Sửa khách hàng">
                    <i className="fas fa-edit"></i>
                  </button></div>}
          </div>
          <EditCustomerModal isOpen={isEditModalOpen} customer={editingCustomer} onClose={() => setIsEditModalOpen(false)} onSave={handleCustomerSave} />
        </div>
        <div className="mt-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Thực hiện</button>
        </div>
      </form>

      <div>
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-2">Ngày</th>
              <th className="p-2">Sản phẩm</th>
              <th className="p-2">Loại</th>
              <th className="p-2">Số lượng</th>
              <th className="p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="p-2">{new Date(m.date).toLocaleString()}</td>
                <td className="p-2">{m.product?.name || '—'}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{m.quantity}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-900" title="Xóa">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovements;
