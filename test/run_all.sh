#!/bin/bash

echo "====================================================================="
echo "  HỆ THỐNG KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG VÀ PHI CHỨC NĂNG - CLINIC APP"
echo "====================================================================="
echo ""

# 1. Kiểm tra cổng 3000
echo "[*] Đang kiểm tra cổng 3000..."
if netstat -ano 2>/dev/null | grep -q ":3000" || lsof -i :3000 -t >/dev/null 2>&1; then
    echo "[OK] Máy chủ Nha khoa đã hoạt động ở địa chỉ http://localhost:3000."
else
    echo "[!] Máy chủ chưa chạy. Đang tự động khởi động Máy chủ Nha khoa ở chế độ nền..."
    cd "C:/Users/ASUS/OneDrive/Máy tính/dentist/dentist-app" && pnpm dev &
    cd - > /dev/null
    echo "[*] Đang đợi Máy chủ Nha khoa khởi tạo trong 10 giây..."
    sleep 10
fi

# 2. Khởi chạy Playwright Test Suite
echo ""
echo "[*] Bắt đầu chạy tất cả các kịch bản kiểm thử E2E (Chức năng + Bảo mật/Hiệu năng)..."
npx playwright test

# 3. Mở Báo cáo Kết quả kiểm thử trực quan
echo ""
echo "[OK] Đã chạy xong toàn bộ testcases. Đang mở Báo cáo Kiểm thử trực quan (HTML)..."
npx playwright show-report
read -p "Nhấn phím bất kỳ để thoát..."
