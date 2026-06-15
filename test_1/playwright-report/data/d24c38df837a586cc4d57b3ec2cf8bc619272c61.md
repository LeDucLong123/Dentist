# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: system-tests\admin-management.spec.ts >> Module 3: Quản trị & Nghiệp vụ nội bộ (Admin Management & Payroll) >> TC_MGMT_002: Bác sĩ xem bảng lương - Yêu cầu hiển thị tên bệnh nhân & Chặn chỉnh sửa
- Location: tests\system-tests\admin-management.spec.ts:51:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Đăng xuất')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - heading "Clinical Serenity" [level=1] [ref=e6]
          - paragraph [ref=e7]: Quản lý nha khoa
        - button "Thu gọn sidebar" [ref=e8]:
          - img [ref=e9]
      - navigation [ref=e11]:
        - link "Người dùng" [ref=e12] [cursor=pointer]:
          - /url: /users
          - img [ref=e13]
          - generic [ref=e18]: Người dùng
        - link "Bác sĩ" [ref=e19] [cursor=pointer]:
          - /url: /doctors
          - img [ref=e20]
          - generic [ref=e26]: Bác sĩ
        - link "Lịch khám" [ref=e27] [cursor=pointer]:
          - /url: /appointments
          - img [ref=e28]
          - generic [ref=e33]: Lịch khám
        - link "Tính lương" [ref=e34] [cursor=pointer]:
          - /url: /payroll
          - img [ref=e35]
          - generic [ref=e40]: Tính lương
        - link "Cài đặt" [ref=e41] [cursor=pointer]:
          - /url: /settings
          - img [ref=e42]
          - generic [ref=e45]: Cài đặt
      - link "Trung tâm hỗ trợ" [ref=e47] [cursor=pointer]:
        - /url: /help
        - img [ref=e48]
        - generic [ref=e55]: Trung tâm hỗ trợ
    - main [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]:
          - img [ref=e60]
          - generic [ref=e65]:
            - paragraph [ref=e66]: Chào buổi chiều,
            - paragraph [ref=e67]: BS. Phạm Thành Nam
        - generic [ref=e68]:
          - generic [ref=e69]:
            - img [ref=e70]
            - generic [ref=e73]:
              - paragraph [ref=e74]: 15:17:50
              - paragraph [ref=e75]: Thứ Hai, 15 tháng 6, 2026
          - button "3" [ref=e78]:
            - img [ref=e79]
            - generic [ref=e82]: "3"
          - button "BS. Phạm Thành Nam BS. Phạm Thành Nam Bác sĩ" [active] [ref=e84]:
            - img "BS. Phạm Thành Nam" [ref=e86]
            - generic [ref=e87]:
              - paragraph [ref=e88]: BS. Phạm Thành Nam
              - paragraph [ref=e89]: Bác sĩ
            - img [ref=e90]
      - generic [ref=e92]:
        - navigation [ref=e93]:
          - generic [ref=e94]: Hệ thống
          - img [ref=e95]
          - generic [ref=e97]: Tính lương bác sĩ
        - generic [ref=e98]:
          - generic [ref=e100]:
            - generic [ref=e101]:
              - img [ref=e103]
              - heading "Tính Lương Bác Sĩ" [level=1] [ref=e108]
            - paragraph [ref=e109]: Tính toán tiền lương, thù lao ca khám ngoài giờ cho bác sĩ dựa trên kỳ tính lương và giai đoạn.
          - generic [ref=e110]:
            - generic [ref=e111]:
              - img [ref=e112]
              - combobox [ref=e117] [cursor=pointer]:
                - option "Tháng 06/2026 (Đã chốt)"
                - option "Tháng 07/2026 (Nháp)" [selected]
            - button "Xuất bảng kê" [ref=e119]:
              - img
              - generic [ref=e120]: Xuất bảng kê
        - generic [ref=e121]:
          - generic [ref=e122]:
            - img [ref=e123]
            - generic [ref=e127]:
              - paragraph [ref=e128]: Trạng thái Nháp (Đang tính toán)
              - paragraph [ref=e129]:
                - text: Số liệu tiền lương và ca khám ngoài giờ bên dưới là tạm tính. Bạn có thể thay đổi đơn giá, hệ số hoặc thêm ca khám mới. Bạn có thể nhấn
                - strong [ref=e130]: "\"Chốt kỳ lương\""
                - text: để đóng băng số liệu, hoặc tạo kỳ lương nháp mới trước.
          - button "Tạo kỳ nháp mới" [ref=e131]
        - generic [ref=e132]:
          - generic [ref=e133]:
            - paragraph [ref=e134]: Tổng quỹ lương thực lĩnh
            - paragraph [ref=e135]: 450.000 ₫
            - paragraph [ref=e136]: Không phụ cấp & khấu trừ
          - generic [ref=e137]:
            - paragraph [ref=e138]: Tổng số ca khám hoàn thành
            - paragraph [ref=e139]: 1 ca
            - paragraph [ref=e140]: "Tổng giờ thực tế: 1.5 h"
          - generic [ref=e141]:
            - paragraph [ref=e142]: Tổng số giờ quy đổi
            - paragraph [ref=e143]: 1.5 h
            - paragraph [ref=e144]: "Đơn giá thù lao: 200.000 ₫/h"
          - generic [ref=e145]:
            - paragraph [ref=e146]: Lương bác sĩ trung bình
            - paragraph [ref=e147]: 56.250 ₫
            - paragraph [ref=e148]: Tính trên 8 bác sĩ
        - generic [ref=e150]:
          - generic [ref=e151]:
            - generic [ref=e153]:
              - img [ref=e154]
              - heading "Bảng kê chi tiết tiền lương bác sĩ (Tháng 07/2026)" [level=2] [ref=e165]
            - table [ref=e167]:
              - rowgroup [ref=e168]:
                - row "Bác sĩ Hệ số BS Số ca Giờ thực tế Giờ quy đổi Đơn giá/giờ Thực lĩnh Thao tác" [ref=e169]:
                  - columnheader "Bác sĩ" [ref=e170]
                  - columnheader "Hệ số BS" [ref=e171]
                  - columnheader "Số ca" [ref=e172]
                  - columnheader "Giờ thực tế" [ref=e173]
                  - columnheader "Giờ quy đổi" [ref=e174]
                  - columnheader "Đơn giá/giờ" [ref=e175]
                  - columnheader "Thực lĩnh" [ref=e176]
                  - columnheader "Thao tác" [ref=e177]
              - rowgroup [ref=e178]:
                - row "Lê Đức Long Bác sĩ · Tốt nghiệp đại học 1.3 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e179]:
                  - cell "Lê Đức Long Bác sĩ · Tốt nghiệp đại học" [ref=e180]:
                    - paragraph [ref=e181]: Lê Đức Long
                    - paragraph [ref=e182]: Bác sĩ · Tốt nghiệp đại học
                  - cell "1.3" [ref=e183]
                  - cell "0 ca" [ref=e184]
                  - cell "0.0 h" [ref=e185]
                  - cell "0.0 h" [ref=e186]
                  - cell "200.000 ₫" [ref=e187]
                  - cell "0 ₫" [ref=e188]
                  - cell "Phiếu lương" [ref=e189]:
                    - button "Phiếu lương" [ref=e190]
                - row "Phạm Văn Phú Bác sĩ · BS 1.3 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e191]:
                  - cell "Phạm Văn Phú Bác sĩ · BS" [ref=e192]:
                    - paragraph [ref=e193]: Phạm Văn Phú
                    - paragraph [ref=e194]: Bác sĩ · BS
                  - cell "1.3" [ref=e195]
                  - cell "0 ca" [ref=e196]
                  - cell "0.0 h" [ref=e197]
                  - cell "0.0 h" [ref=e198]
                  - cell "200.000 ₫" [ref=e199]
                  - cell "0 ₫" [ref=e200]
                  - cell "Phiếu lương" [ref=e201]:
                    - button "Phiếu lương" [ref=e202]
                - row "Nguyễn Kiều Mai Bác sĩ · BS 1.3 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e203]:
                  - cell "Nguyễn Kiều Mai Bác sĩ · BS" [ref=e204]:
                    - paragraph [ref=e205]: Nguyễn Kiều Mai
                    - paragraph [ref=e206]: Bác sĩ · BS
                  - cell "1.3" [ref=e207]
                  - cell "0 ca" [ref=e208]
                  - cell "0.0 h" [ref=e209]
                  - cell "0.0 h" [ref=e210]
                  - cell "200.000 ₫" [ref=e211]
                  - cell "0 ₫" [ref=e212]
                  - cell "Phiếu lương" [ref=e213]:
                    - button "Phiếu lương" [ref=e214]
                - row "BS. Phạm Thành Nam Bác sĩ · Tiến sĩ 1.7 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e215]:
                  - cell "BS. Phạm Thành Nam Bác sĩ · Tiến sĩ" [ref=e216]:
                    - paragraph [ref=e217]: BS. Phạm Thành Nam
                    - paragraph [ref=e218]: Bác sĩ · Tiến sĩ
                  - cell "1.7" [ref=e219]
                  - cell "0 ca" [ref=e220]
                  - cell "0.0 h" [ref=e221]
                  - cell "0.0 h" [ref=e222]
                  - cell "200.000 ₫" [ref=e223]
                  - cell "0 ₫" [ref=e224]
                  - cell "Phiếu lương" [ref=e225]:
                    - button "Phiếu lương" [ref=e226]
                - row "ThS.BS. Nguyễn Minh Thư Bác sĩ · Thạc sĩ 1.5 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e227]:
                  - cell "ThS.BS. Nguyễn Minh Thư Bác sĩ · Thạc sĩ" [ref=e228]:
                    - paragraph [ref=e229]: ThS.BS. Nguyễn Minh Thư
                    - paragraph [ref=e230]: Bác sĩ · Thạc sĩ
                  - cell "1.5" [ref=e231]
                  - cell "0 ca" [ref=e232]
                  - cell "0.0 h" [ref=e233]
                  - cell "0.0 h" [ref=e234]
                  - cell "200.000 ₫" [ref=e235]
                  - cell "0 ₫" [ref=e236]
                  - cell "Phiếu lương" [ref=e237]:
                    - button "Phiếu lương" [ref=e238]
                - row "BS. Lê Hoàng Vũ Bác sĩ · BSCK I 1.5 1 ca 1.5 h 1.5 h 200.000 ₫ 450.000 ₫ Phiếu lương" [ref=e239]:
                  - cell "BS. Lê Hoàng Vũ Bác sĩ · BSCK I" [ref=e240]:
                    - paragraph [ref=e241]: BS. Lê Hoàng Vũ
                    - paragraph [ref=e242]: Bác sĩ · BSCK I
                  - cell "1.5" [ref=e243]
                  - cell "1 ca" [ref=e244]
                  - cell "1.5 h" [ref=e245]
                  - cell "1.5 h" [ref=e246]
                  - cell "200.000 ₫" [ref=e247]
                  - cell "450.000 ₫" [ref=e248]
                  - cell "Phiếu lương" [ref=e249]:
                    - button "Phiếu lương" [ref=e250]
                - row "BS. Trần Mai Anh Bác sĩ · BSCK II 1.7 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e251]:
                  - cell "BS. Trần Mai Anh Bác sĩ · BSCK II" [ref=e252]:
                    - paragraph [ref=e253]: BS. Trần Mai Anh
                    - paragraph [ref=e254]: Bác sĩ · BSCK II
                  - cell "1.7" [ref=e255]
                  - cell "0 ca" [ref=e256]
                  - cell "0.0 h" [ref=e257]
                  - cell "0.0 h" [ref=e258]
                  - cell "200.000 ₫" [ref=e259]
                  - cell "0 ₫" [ref=e260]
                  - cell "Phiếu lương" [ref=e261]:
                    - button "Phiếu lương" [ref=e262]
                - row "BS. Đỗ Quang Khải Bác sĩ · Thạc sĩ 1.5 0 ca 0.0 h 0.0 h 200.000 ₫ 0 ₫ Phiếu lương" [ref=e263]:
                  - cell "BS. Đỗ Quang Khải Bác sĩ · Thạc sĩ" [ref=e264]:
                    - paragraph [ref=e265]: BS. Đỗ Quang Khải
                    - paragraph [ref=e266]: Bác sĩ · Thạc sĩ
                  - cell "1.5" [ref=e267]
                  - cell "0 ca" [ref=e268]
                  - cell "0.0 h" [ref=e269]
                  - cell "0.0 h" [ref=e270]
                  - cell "200.000 ₫" [ref=e271]
                  - cell "0 ₫" [ref=e272]
                  - cell "Phiếu lương" [ref=e273]:
                    - button "Phiếu lương" [ref=e274]
          - generic [ref=e275]:
            - generic [ref=e276]: "* Lương được tính chính xác theo thù lao ca khám: Giờ quy đổi * Hệ số bác sĩ * Đơn giá/giờ. Không áp dụng thuế, bảo hiểm, phụ cấp hay lương cơ bản."
            - generic [ref=e277]: Clinical Serenity System v1.0
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e283] [cursor=pointer]:
    - img [ref=e284]
  - alert [ref=e288]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Module 3: Quản trị & Nghiệp vụ nội bộ (Admin Management & Payroll)", () => {
  4   |   const BASE_URL = "http://localhost:3000";
  5   | 
  6   |   test("TC_MGMT_001: Quản lý bệnh nhân & bác sĩ - Kiểm tra phân quyền xem/sửa", async ({ page }) => {
  7   |     // ----------------------------------------------------
  8   |     // 1. Log in as Receptionist and verify READ-ONLY limits
  9   |     // ----------------------------------------------------
  10  |     console.log("Logging in as Receptionist...");
  11  |     await page.goto(`${BASE_URL}/login`);
  12  |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
  13  |     await page.getByPlaceholder('••••••••').fill("patient123");
  14  |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  15  | 
  16  |     // Wait until logged in
  17  |     await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });
  18  | 
  19  |     // Go to Patient/Users list
  20  |     await page.getByRole('link', { name: 'Người dùng' }).click();
  21  |     await expect(page.locator("text=Người dùng").first()).toBeVisible({ timeout: 15000 });
  22  |     // Receptionist should NOT see "Thêm" button
  23  |     await expect(page.locator('button:has-text("Thêm")')).not.toBeVisible();
  24  | 
  25  |     // Go to Doctor list
  26  |     await page.getByRole('link', { name: 'Bác sĩ' }).click();
  27  |     await expect(page.locator("text=Bác sĩ").first()).toBeVisible({ timeout: 15000 });
  28  |     // Receptionist should NOT see "Thêm bác sĩ" or "Thêm" button
  29  |     await expect(page.locator('button:has-text("Thêm")')).not.toBeVisible();
  30  | 
  31  |     // Verify Receptionist has no access to services or pricing configuration pages
  32  |     await page.goto(`${BASE_URL}/services`);
  33  |     await expect(page).not.toHaveURL(`${BASE_URL}/services`);
  34  | 
  35  |     await page.goto(`${BASE_URL}/pricing`);
  36  |     await expect(page).not.toHaveURL(`${BASE_URL}/pricing`);
  37  | 
  38  |     // Log out (Depends on topbar layout, usually clicking avatar then "Đăng xuất" or a direct link)
  39  |     // To be safe, navigate directly to logout if there's a logout api, or just clear cookies.
  40  |     // Or we can rely on standard click
  41  |     const logoutBtn = page.locator('text=Đăng xuất');
  42  |     if (await logoutBtn.isVisible()) {
  43  |         await logoutBtn.click();
  44  |     } else {
  45  |         // Fallback: click user menu then logout
  46  |         await page.locator('header').locator('button').last().click();
  47  |         await page.locator('text=Đăng xuất').click();
  48  |     }
  49  |   });
  50  | 
  51  |   test("TC_MGMT_002: Bác sĩ xem bảng lương - Yêu cầu hiển thị tên bệnh nhân & Chặn chỉnh sửa", async ({ page }) => {
  52  |     // ----------------------------------------------------
  53  |     // 2. Log in as Doctor to view payroll
  54  |     // ----------------------------------------------------
  55  |     console.log("Logging in as Doctor...");
  56  |     await page.goto(`${BASE_URL}/login`);
  57  |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("nam.pham@serenity.vn");
  58  |     await page.getByPlaceholder('••••••••').fill("doctor123");
  59  |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  60  | 
  61  |     // Go to payroll page
  62  |     await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });
  63  |     await page.getByRole('link', { name: 'Tính lương' }).click();
  64  |     await expect(page.locator("text=lương").first()).toBeVisible({ timeout: 15000 });
  65  | 
  66  |     // Verify doctor can only see their own payroll information and CANNOT edit config
  67  |     await expect(page.locator('button:has-text("Lưu cấu hình")')).not.toBeVisible();
  68  |     await expect(page.locator('button:has-text("Chốt lương")')).not.toBeVisible();
  69  |     await expect(page.locator('button:has-text("Chốt bảng lương")')).not.toBeVisible();
  70  | 
  71  |     // Click on payslip details and verify it displays the list of treated patients
  72  |     const detailBtn = page.locator('button:has-text("Xem chi tiết")');
  73  |     if (await detailBtn.count() > 0) {
  74  |         await detailBtn.first().click();
  75  |         await expect(page.locator("text=Bệnh nhân").first()).toBeVisible();
  76  |         await expect(page.locator("text=Dịch vụ").first()).toBeVisible();
  77  |         
  78  |         // Close details
  79  |         const closeBtn = page.locator('button:has-text("Đóng")');
  80  |         if (await closeBtn.isVisible()) {
  81  |             await closeBtn.click();
  82  |         }
  83  |     }
  84  | 
  85  |     // Log out
  86  |     const logoutBtn = page.locator('text=Đăng xuất');
  87  |     if (await logoutBtn.isVisible()) {
  88  |         await logoutBtn.click();
  89  |     } else {
  90  |         await page.locator('header').locator('button').last().click();
> 91  |         await page.locator('text=Đăng xuất').click();
      |                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  92  |     }
  93  |   });
  94  | 
  95  |   test("TC_MGMT_003: Admin chốt bảng lương - Đóng băng dữ liệu (Read-only after Freeze)", async ({ page }) => {
  96  |     // ----------------------------------------------------
  97  |     // 3. Log in as Admin to freeze payroll
  98  |     // ----------------------------------------------------
  99  |     console.log("Logging in as Admin...");
  100 |     await page.goto(`${BASE_URL}/login`);
  101 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
  102 |     await page.getByPlaceholder('••••••••').fill("admin123");
  103 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  104 | 
  105 |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
  106 |     await page.getByRole('link', { name: 'Tính lương' }).click();
  107 |     await expect(page.locator("text=lương").first()).toBeVisible({ timeout: 15000 });
  108 | 
  109 |     // Check if there is an active draft payroll to freeze
  110 |     const chotLuongBtn = page.locator('button:has-text("Chốt")');
  111 |     if (await chotLuongBtn.isVisible()) {
  112 |       await chotLuongBtn.click();
  113 |       const dongYBtn = page.locator('button:has-text("Đồng ý")');
  114 |       if (await dongYBtn.isVisible()) {
  115 |          await dongYBtn.click();
  116 |       }
  117 |       await expect(page.locator("text=Đã chốt").first()).toBeVisible({ timeout: 10000 });
  118 | 
  119 |       // Verify input boxes for commission rate or shift rates are now disabled/read-only (TC_PAYROLL_006)
  120 |       const inputElements = page.locator('input[type="number"]');
  121 |       const count = await inputElements.count();
  122 |       for (let i = 0; i < count; i++) {
  123 |         await expect(inputElements.nth(i)).toBeDisabled();
  124 |       }
  125 |     }
  126 |   });
  127 | });
  128 | 
```