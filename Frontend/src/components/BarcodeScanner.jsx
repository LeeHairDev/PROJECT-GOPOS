import React from 'react';

/**
 * Component hiển thị trạng thái quét mã vạch
 */
export const BarcodeScanner = ({ isScanning, barcodeBuffer, onClose }) => {
  if (!isScanning && !barcodeBuffer) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse max-w-xs">
      <div className="flex items-center gap-2">
        <i className="fas fa-barcode text-lg animate-spin"></i>
        <div>
          <p className="text-xs font-semibold">Quét mã vạch</p>
          <p className="text-xs opacity-90 break-all">{barcodeBuffer || 'Sẵn sàng...'}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-white hover:bg-blue-700 p-1 rounded"
          title="Đóng"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default BarcodeScanner;
