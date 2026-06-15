# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: example.spec.ts >> submit
- Location: tests\example.spec.ts:20:5

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Next App/
Received string:  "Clinical Serenity"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    11 × unexpected value "Clinical Serenity"

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
- textbox "admin@clinicserenity.vn"
- text: Mật khẩu
- link "Quên mật khẩu?":
  - /url: "#"
- textbox "••••••••"
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
  3  | // test('has title', async ({ page }) => {
  4  | //   await page.goto('https://playwright.dev/');
  5  | 
  6  | //   // Expect a title "to contain" a substring.
  7  | //   await expect(page).toHaveTitle(/Playwright/);
  8  | // });
  9  | 
  10 | // test('get started link', async ({ page }) => {
  11 | //   await page.goto('https://playwright.dev/');
  12 | 
  13 | //   // Click the get started link.
  14 | //   await page.getByRole('link', { name: 'Get started' }).click();
  15 | 
  16 | //   // Expects page to have a heading with the name of Installation.
  17 | //   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  18 | // });
  19 | 
  20 | test("submit", async ({ page }) => {
  21 |   await page.goto("http://localhost:3000/");
  22 | 
> 23 |   await expect(page).toHaveTitle(/Next App/);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  24 | });
  25 | 
```