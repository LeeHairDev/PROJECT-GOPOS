import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook cho quét mã vạch
 * Sử dụng sự kiện keyboard để mô phỏng quét mã vạch (các thiết bị quét mã vạch vật lý gửi các ký tự như keyboard)
 */
export const useBarcodeScanner = (onBarcodeScanned, enabled = true) => {
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedAt, setLastScannedAt] = useState(0);

  // Timeout để phát hiện khi quét hoàn tất
  const SCAN_TIMEOUT = 50; // milliseconds
  const BARCODE_MIN_LENGTH = 3; // Độ dài tối thiểu của mã vạch
  const BARCODE_MAX_LENGTH = 50; // Độ dài tối đa của mã vạch

  // Xử lý khi hoàn tất quét mã vạch
  useEffect(() => {
    if (!barcodeBuffer || !isScanning) return;

    const timer = setTimeout(() => {
      if (
        barcodeBuffer.length >= BARCODE_MIN_LENGTH &&
        barcodeBuffer.length <= BARCODE_MAX_LENGTH
      ) {
        // Gọi callback với mã vạch đã quét
        if (onBarcodeScanned) {
          onBarcodeScanned(barcodeBuffer.trim());
        }
        // Reset buffer
        setBarcodeBuffer("");
        setIsScanning(false);
      } else if (barcodeBuffer.length > BARCODE_MAX_LENGTH) {
        // Reset nếu quá dài
        setBarcodeBuffer("");
        setIsScanning(false);
      }
    }, SCAN_TIMEOUT);

    return () => clearTimeout(timer);
  }, [barcodeBuffer, isScanning, onBarcodeScanned]);

  // Xử lý sự kiện keyboard
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      const now = Date.now();
      const timeSinceLastChar = now - lastScannedAt;

      // Kiểm tra xem phím có phải từ scanner hay không
      // Scanner thường gửi các ký tự liên tiếp trong thời gian ngắn
      // và kết thúc bằng phím Enter

      if (event.key === "Enter" && barcodeBuffer.length > 0) {
        // Enter thường được gửi bởi scanner khi quét xong
        event.preventDefault();
        if (onBarcodeScanned) {
          onBarcodeScanned(barcodeBuffer.trim());
        }
        setBarcodeBuffer("");
        setIsScanning(false);
        return;
      }

      // Nếu phím không phải ký tự in được hoặc là phím đặc biệt, bỏ qua
      if (event.key.length > 1 && event.key !== "Enter") {
        return;
      }

      // Nếu quá nhiều thời gian giữa các ký tự, reset buffer
      // (không phải từ scanner)
      if (timeSinceLastChar > 100 && barcodeBuffer.length > 0) {
        setBarcodeBuffer("");
      }

      // Thêm ký tự vào buffer
      if (event.key.length === 1) {
        event.preventDefault();
        setBarcodeBuffer((prev) => prev + event.key);
        setIsScanning(true);
        setLastScannedAt(now);
      }
    },
    [enabled, barcodeBuffer, onBarcodeScanned, lastScannedAt]
  );

  // Thêm event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    barcodeBuffer,
    isScanning,
    clearBuffer: () => {
      setBarcodeBuffer("");
      setIsScanning(false);
    },
  };
};

export default useBarcodeScanner;
