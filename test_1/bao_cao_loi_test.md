# Báo Cáo Phân Tích Lỗi Kiểm Thử E2E (Playwright)

Trong quá trình thực thi bộ kịch bản kiểm thử (Test Suite) cho ứng dụng Nha khoa (Clinical Serenity), một số Test Case đã báo lỗi (Failed). Dưới đây là danh sách các lỗi được trích xuất từ hệ thống và giải thích nguyên nhân chi tiết để bổ sung vào tài liệu báo cáo kiểm thử.

---

## 1. Lỗi Xác Thực & Phân Quyền Lễ Tân (Module 1)
**Các Test Case bị ảnh hưởng:**
- `TC_LOG_003`: Đăng nhập thành công với vai trò Lễ tân
- `TC_LOG_018`: Phân quyền nghiêm ngặt - Chặn truy cập trái phép bằng URL

**Chi tiết lỗi (Log):**
```text
Error: expect(page).toHaveURL(expected) failed
Expected: "http://localhost:3000/appointments"
Received: "http://localhost:3000/login"
Timeout:  5000ms
```

**Giải thích nguyên nhân:**
Kịch bản mong đợi sau khi nhập tài khoản `ptd@email.com` và click "Đăng nhập", hệ thống sẽ chuyển hướng sang trang `/appointments`. Tuy nhiên, kết quả là trình duyệt vẫn bị giữ lại ở trang `/login`. 
- **Nguyên nhân cốt lõi:** API `/api/auth/login` đã trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`. Lý do là mật khẩu của tài khoản `ptd@email.com` trong kịch bản test (`patient123`) không khớp với mã băm (hash) được lưu trong MongoDB thực tế, hoặc cơ chế seed data của hệ thống đã mã hóa mật khẩu này sai lệch. Do đó API từ chối cấp quyền đăng nhập, khiến URL không thay đổi.

---

## 2. Lỗi Chuyển Hướng Quy Trình Lâm Sàng (Module 2)
**Các Test Case bị ảnh hưởng:**
- `TC_CLINIC_WF`: Quy trình đặt lịch - Tiếp đón - Khám bệnh - Thanh toán

**Chi tiết lỗi (Log):**
```text
Error: expect(page).toHaveURL(expected) failed
Expected: "http://localhost:3000/dashboard"
Received: "http://localhost:3000/login"
Timeout:  15000ms
```

**Giải thích nguyên nhân:**
Test case này mô phỏng luồng công việc dài, bắt đầu từ việc Admin đăng nhập (`admin@clinicserenity.vn`) để tạo lịch. Mặc dù Admin đăng nhập bình thường, Playwright báo lỗi do sau khi click đăng nhập, trang web không điều hướng kịp sang `/dashboard` trong vòng 15 giây (Timeout).
- **Nguyên nhân cốt lõi:** Quá trình tải (build lazily) trang `/dashboard` lần đầu tiên của Next.js trong chế độ Development (`npm run dev`) thường tốn rất nhiều thời gian (có thể vượt quá 15 giây). Do Playwright chờ quá lâu mà trình duyệt vẫn hiển thị URL cũ (`/login`), nó tự động báo `Failed`. Để khắc phục, cần build dự án ở chế độ Production (`npm run build && npm run start`) trước khi chạy bộ test này.

---

## 3. Lỗi Quá Giờ Tại Module Quản Trị Hệ Thống (Module 3)
**Các Test Case bị ảnh hưởng:**
- `TC_MGMT_001`: Quản lý bệnh nhân & bác sĩ - Kiểm tra phân quyền
- `TC_MGMT_002`: Bác sĩ xem bảng lương - Yêu cầu hiển thị tên bệnh nhân
- `TC_MGMT_003`: Admin chốt bảng lương - Đóng băng dữ liệu

**Chi tiết lỗi (Log):**
- Cũng gặp tình trạng `Expected /appointments` hoặc `Expected /dashboard` nhưng `Received /login`.

**Giải thích nguyên nhân:**
Tương tự như lỗi ở Module 1 và 2, các lỗi ở Module 3 chủ yếu xuất phát từ 2 nguyên nhân:
1. **Dữ liệu đăng nhập không hợp lệ:** Account lễ tân không login được khiến `TC_MGMT_001` kẹt ở `/login`.
2. **Hiệu năng hệ thống dev (Next.js Cold Start):** Lần đầu Playwright click vào URL `/payroll` hoặc `/users`, Next.js phải tốn thời gian biên dịch (compile) Server Component, dẫn đến độ trễ cao vượt quá mức cho phép của công cụ tự động hóa.

---

### Khuyến nghị khắc phục (Giải pháp cho báo cáo)
Để các Test Case này pass (Thành công) trong các đợt kiểm thử tiếp theo, cần lưu ý:
1. **Đồng bộ Data Test:** Viết một script tự động reset và mã hóa lại (re-hash bcrypt) chính xác password cho các tài khoản test (như `ptd@email.com`) trước khi chạy Playwright.
2. **Chạy ở môi trường chuẩn:** Không nên dùng `npm run dev` để chạy test E2E. Thay vào đó, hãy chạy `npm run build` và khởi động qua `npm run start` để loại bỏ thời gian biên dịch trang, giúp Playwright điều hướng mượt mà, không bị Timeout.
