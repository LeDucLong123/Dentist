# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: system-tests\auth.spec.ts >> Module 1: Đăng nhập & Bảo mật (Auth & Security) >> TC_LOG_002: Đăng nhập thành công với vai trò Bác sĩ
- Location: tests\system-tests\auth.spec.ts:22:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/appointments"
Received: "http://localhost:3000/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/login"

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
- text: Email
- textbox "admin@clinicserenity.vn": nam.pham@serenity.vn
- text: Mật khẩu
- link "Quên mật khẩu?":
  - /url: "#"
- textbox "••••••••": doctor123
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
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Module 1: Đăng nhập & Bảo mật (Auth & Security)", () => {
  4  |   const BASE_URL = "http://localhost:3000";
  5  | 
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.goto(`${BASE_URL}/login`);
  8  |   });
  9  | 
  10 |   test("TC_LOG_001: Đăng nhập thành công với vai trò Admin", async ({ page }) => {
  11 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
  12 |     await page.getByPlaceholder('••••••••').fill("admin123");
  13 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  14 | 
  15 |     // Admin should be redirected to dashboard
  16 |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  17 |     await expect(page.getByRole('link', { name: 'Thống kê' })).toBeVisible();
  18 |     await expect(page.getByRole('link', { name: 'Bác sĩ' })).toBeVisible();
  19 |     await expect(page.getByRole('link', { name: 'Tính lương' })).toBeVisible();
  20 |   });
  21 | 
  22 |   test("TC_LOG_002: Đăng nhập thành công với vai trò Bác sĩ", async ({ page }) => {
  23 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("nam.pham@serenity.vn");
  24 |     await page.getByPlaceholder('••••••••').fill("doctor123");
  25 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  26 | 
  27 |     // Doctor should be redirected to appointments list and NOT see admin-only items
> 28 |     await expect(page).toHaveURL(`${BASE_URL}/appointments`);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  29 |     await expect(page.getByRole('link', { name: 'Lịch khám' })).toBeVisible();
  30 |     await expect(page.getByRole('link', { name: 'Thống kê' })).not.toBeVisible();
  31 |     await expect(page.getByRole('link', { name: 'Dịch vụ' })).not.toBeVisible();
  32 |   });
  33 | 
  34 |   test("TC_LOG_003: Đăng nhập thành công với vai trò Lễ tân", async ({ page }) => {
  35 |     // Requires a valid receptionist account in the DB
  36 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
  37 |     await page.getByPlaceholder('••••••••').fill("patient123");
  38 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  39 | 
  40 |     await expect(page).toHaveURL(`${BASE_URL}/appointments`);
  41 |     await expect(page.getByRole('link', { name: 'Thống kê' })).not.toBeVisible();
  42 |     await expect(page.getByRole('link', { name: 'Dịch vụ' })).not.toBeVisible();
  43 |   });
  44 | 
  45 |   test("TC_LOG_004: Đăng nhập thất bại - Bỏ trống thông tin", async ({ page }) => {
  46 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  47 |     
  48 |     // Check client-side browser validations or alert error text
  49 |     const isErrorVisible = await page.locator('.bg-red-50').isVisible();
  50 |     expect(isErrorVisible).toBeTruthy();
  51 |   });
  52 | 
  53 |   test("TC_LOG_006: Đăng nhập thất bại - Sai Mật khẩu", async ({ page }) => {
  54 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
  55 |     await page.getByPlaceholder('••••••••').fill("wrong_pass_123");
  56 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  57 | 
  58 |     await expect(page.locator('.bg-red-50')).toBeVisible();
  59 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
  60 |   });
  61 | 
  62 |   test("TC_LOG_011: Bảo mật - Chống tấn công SQL Injection", async ({ page }) => {
  63 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("' OR '1'='1' --");
  64 |     await page.getByPlaceholder('••••••••').fill("' OR '1'='1'");
  65 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  66 | 
  67 |     await expect(page.locator('.bg-red-50')).toBeVisible();
  68 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
  69 |   });
  70 | 
  71 |   test("TC_LOG_012: Bảo mật - Chống tấn công Cross-Site Scripting (XSS)", async ({ page }) => {
  72 |     const xssPayload = "<script>window.location='http://hack.com'</script>@gmail.com";
  73 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill(xssPayload);
  74 |     await page.getByPlaceholder('••••••••').fill("123456");
  75 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  76 | 
  77 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
  78 |     await expect(page.locator('.bg-red-50')).toBeVisible();
  79 |   });
  80 | 
  81 |   test("TC_LOG_018: Phân quyền nghiêm ngặt - Chặn truy cập trái phép bằng URL", async ({ page }) => {
  82 |     // Log in as Receptionist
  83 |     await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
  84 |     await page.getByPlaceholder('••••••••').fill("patient123");
  85 |     await page.getByRole('button', { name: /Đăng nhập/ }).click();
  86 |     await expect(page).toHaveURL(`${BASE_URL}/appointments`);
  87 | 
  88 |     // Try to visit /dashboard directly
  89 |     await page.goto(`${BASE_URL}/dashboard`);
  90 |     await expect(page).not.toHaveURL(`${BASE_URL}/dashboard`);
  91 |   });
  92 | });
  93 | 
```