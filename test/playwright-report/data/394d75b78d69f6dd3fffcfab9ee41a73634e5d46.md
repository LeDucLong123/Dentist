# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: system-tests\admin-management.spec.ts >> Module 3: Quản trị & Nghiệp vụ nội bộ (Admin Management & Payroll) >> TC_MGMT_001: Quản lý bệnh nhân & bác sĩ - Kiểm tra phân quyền xem/sửa
- Location: tests\system-tests\admin-management.spec.ts:6:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/appointments"
Received: "http://localhost:3000/login"
Timeout:  15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    30 × unexpected value "http://localhost:3000/login"

```

```yaml
- text: Clinical Serenity
- paragraph: Hệ thống quản lý nha khoa
- blockquote: "\"Chăm sóc nụ cười của bạn là sứ mệnh của chúng tôi.\""
- paragraph: — Clinical Serenity Team
- paragraph: 1,200+
- paragraph: Bệnh nhân
- paragraph: "24"
- paragraph: Bác sĩ
- paragraph: 98%
- paragraph: Hài lòng
- heading "Đăng nhập" [level=1]
- paragraph:
  - text: Chào mừng trở lại!
  - link "Chưa có tài khoản?":
    - /url: /signup
- text: Email hoặc mật khẩu không chính xác. Email
- textbox "admin@clinicserenity.vn": ptd@email.com
- text: Mật khẩu
- link "Quên mật khẩu?":
  - /url: "#"
- textbox "••••••••": patient123
- button
- checkbox "Ghi nhớ đăng nhập"
- text: Ghi nhớ đăng nhập
- button "Đăng nhập"
- text: hoặc tiếp tục với
- button "Google":
  - img
  - text: Google
- button "Microsoft":
  - img
  - text: Microsoft
- paragraph:
  - text: Bằng cách đăng nhập, bạn đồng ý với
  - link "Điều khoản sử dụng":
    - /url: "#"
  - text: và
  - link "Chính sách bảo mật":
    - /url: "#"
- region "Notifications alt+T"
- alert
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
> 17  |     await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  91  |         await page.locator('text=Đăng xuất').click();
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
```