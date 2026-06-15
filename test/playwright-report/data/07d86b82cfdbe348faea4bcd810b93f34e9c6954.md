# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: system-tests\clinic-workflows.spec.ts >> Module 2: Quy trình lâm sàng & Thanh toán (Clinical Workflows & Billing) >> TC_CLINIC_WF: Quy trình đặt lịch - Tiếp đón - Khám bệnh - Thanh toán
- Location: tests\system-tests\clinic-workflows.spec.ts:6:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/dashboard"
Received: "http://localhost:3000/login"
Timeout:  15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × unexpected value "http://localhost:3000/login"

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
- text: Vui lòng cung cấp cả email và mật khẩu. Email
- textbox "admin@clinicserenity.vn"
- text: Mật khẩu
- link "Quên mật khẩu?":
  - /url: "#"
- textbox "••••••••": admin123
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
  3   | test.describe("Module 2: Quy trình lâm sàng & Thanh toán (Clinical Workflows & Billing)", () => {
  4   |   const BASE_URL = "http://localhost:3000";
  5   | 
  6   |   test("TC_CLINIC_WF: Quy trình đặt lịch - Tiếp đón - Khám bệnh - Thanh toán", async ({ page }) => {
  7   |     // ----------------------------------------------------
  8   |     // STEP 1: Admin or Receptionist books an appointment
  9   |     // ----------------------------------------------------
  10  |     console.log("1. Logging in as Admin to create an appointment...");
  11  |     await page.goto(`${BASE_URL}/login`);
  12  |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
  13  |     await page.getByPlaceholder('••••••••').fill("admin123");
  14  |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
> 15  |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  16  | 
  17  |     // Navigate to appointments and create a new one
  18  |     await page.getByRole('link', { name: 'Lịch khám' }).click();
  19  |     await expect(page.locator("text=Lịch khám").first()).toBeVisible({ timeout: 15000 });
  20  | 
  21  |     const createBtn = page.locator('text=Đặt lịch mới');
  22  |     if (await createBtn.isVisible()) {
  23  |       await createBtn.click();
  24  |       
  25  |       // Select patient, doctor, service and time (if applicable in the new UI)
  26  |       // Since Shadcn Selects are tricky, we'll just check if the form is there
  27  |       await expect(page.locator("text=Tạo lịch khám mới").first()).toBeVisible({ timeout: 10000 });
  28  | 
  29  |       // We skip actually filling out Shadcn selects to avoid brittle tests
  30  |       // In a real scenario we'd use .click() on triggers and .click() on options
  31  |     }
  32  | 
  33  |     // Log out Admin
  34  |     let logoutBtn = page.locator('text=Đăng xuất');
  35  |     if (await logoutBtn.isVisible()) {
  36  |         await logoutBtn.click();
  37  |     } else {
  38  |         await page.locator('header').locator('button').last().click();
  39  |         await page.locator('text=Đăng xuất').click();
  40  |     }
  41  | 
  42  |     // ----------------------------------------------------
  43  |     // STEP 2: Admin confirms the appointment
  44  |     // ----------------------------------------------------
  45  |     console.log("2. Admin confirming the booked appointment...");
  46  |     await page.goto(`${BASE_URL}/login`);
  47  |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
  48  |     await page.getByPlaceholder('••••••••').fill("admin123");
  49  |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  50  | 
  51  |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
  52  |     await page.getByRole('link', { name: 'Lịch khám' }).click();
  53  |     await expect(page.locator("text=Lịch khám").first()).toBeVisible({ timeout: 15000 });
  54  |     
  55  |     // Find an appointment detail link
  56  |     const detailLink = page.locator('a[href^="/appointments/BN"]').first();
  57  |     if (await detailLink.isVisible()) {
  58  |       await detailLink.click();
  59  |       // Admin confirms it
  60  |       const confirmBtn = page.locator('button:has-text("Xác nhận lịch")');
  61  |       if (await confirmBtn.isVisible()) {
  62  |         await confirmBtn.click();
  63  |         await page.locator('button:has-text("Đồng ý")').click();
  64  |         await expect(page.locator("text=Đã xác nhận").first()).toBeVisible();
  65  |       }
  66  |     }
  67  | 
  68  |     // Log out Admin
  69  |     logoutBtn = page.locator('text=Đăng xuất');
  70  |     if (await logoutBtn.isVisible()) {
  71  |         await logoutBtn.click();
  72  |     } else {
  73  |         await page.locator('header').locator('button').last().click();
  74  |         await page.locator('text=Đăng xuất').click();
  75  |     }
  76  | 
  77  |     // ----------------------------------------------------
  78  |     // STEP 3: Receptionist checks in the patient (Tiếp đón)
  79  |     // ----------------------------------------------------
  80  |     console.log("3. Receptionist checking in the patient...");
  81  |     await page.goto(`${BASE_URL}/login`);
  82  |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
  83  |     await page.getByPlaceholder('••••••••').fill("patient123");
  84  |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  85  | 
  86  |     await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });
  87  |     const detailLinkReception = page.locator('a[href^="/appointments/BN"]').first();
  88  |     if (await detailLinkReception.isVisible()) {
  89  |       await detailLinkReception.click();
  90  |       // Receptionist checks in
  91  |       const tiepDonBtn = page.locator('button:has-text("Tiếp đón")');
  92  |       if (await tiepDonBtn.isVisible()) {
  93  |         await tiepDonBtn.click();
  94  |         await page.locator('button:has-text("Đồng ý")').click();
  95  |         await expect(page.locator("text=Đã tiếp đón").first()).toBeVisible();
  96  |       }
  97  |     }
  98  | 
  99  |     // Log out Receptionist
  100 |     logoutBtn = page.locator('text=Đăng xuất');
  101 |     if (await logoutBtn.isVisible()) {
  102 |         await logoutBtn.click();
  103 |     } else {
  104 |         await page.locator('header').locator('button').last().click();
  105 |         await page.locator('text=Đăng xuất').click();
  106 |     }
  107 | 
  108 |     // ----------------------------------------------------
  109 |     // STEP 4: Doctor starts & completes examination
  110 |     // ----------------------------------------------------
  111 |     console.log("4. Doctor starting & completing exam...");
  112 |     await page.goto(`${BASE_URL}/login`);
  113 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("nam.pham@serenity.vn");
  114 |     await page.getByPlaceholder('••••••••').fill("doctor123");
  115 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
```