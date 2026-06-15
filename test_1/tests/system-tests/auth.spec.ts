import { test, expect } from "@playwright/test";

test.describe("Module 1: Đăng nhập & Bảo mật (Auth & Security)", () => {
  const BASE_URL = "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test("TC_LOG_001: Đăng nhập thành công với vai trò Admin", async ({ page }) => {
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
    await page.getByPlaceholder('••••••••').fill("admin123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    // Admin should be redirected to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.getByRole('link', { name: 'Thống kê' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bác sĩ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tính lương' })).toBeVisible();
  });

  test("TC_LOG_002: Đăng nhập thành công với vai trò Bác sĩ", async ({ page }) => {
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("nam.pham@serenity.vn");
    await page.getByPlaceholder('••••••••').fill("doctor123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    // Doctor should be redirected to appointments list and NOT see admin-only items
    await expect(page).toHaveURL(`${BASE_URL}/appointments`);
    await expect(page.getByRole('link', { name: 'Lịch khám' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Thống kê' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Dịch vụ' })).not.toBeVisible();
  });

  test("TC_LOG_003: Đăng nhập thành công với vai trò Lễ tân", async ({ page }) => {
    // Requires a valid receptionist account in the DB
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
    await page.getByPlaceholder('••••••••').fill("patient123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    await expect(page).toHaveURL(`${BASE_URL}/appointments`);
    await expect(page.getByRole('link', { name: 'Thống kê' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Dịch vụ' })).not.toBeVisible();
  });

  test("TC_LOG_004: Đăng nhập thất bại - Bỏ trống thông tin", async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).click();
    
    // Check client-side browser validations or alert error text
    const isErrorVisible = await page.locator('.bg-red-50').isVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test("TC_LOG_006: Đăng nhập thất bại - Sai Mật khẩu", async ({ page }) => {
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
    await page.getByPlaceholder('••••••••').fill("wrong_pass_123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("TC_LOG_011: Bảo mật - Chống tấn công SQL Injection", async ({ page }) => {
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("' OR '1'='1' --");
    await page.getByPlaceholder('••••••••').fill("' OR '1'='1'");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("TC_LOG_012: Bảo mật - Chống tấn công Cross-Site Scripting (XSS)", async ({ page }) => {
    const xssPayload = "<script>window.location='http://hack.com'</script>@gmail.com";
    await page.getByPlaceholder('admin@clinicserenity.vn').fill(xssPayload);
    await page.getByPlaceholder('••••••••').fill("123456");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test("TC_LOG_018: Phân quyền nghiêm ngặt - Chặn truy cập trái phép bằng URL", async ({ page }) => {
    // Log in as Receptionist
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
    await page.getByPlaceholder('••••••••').fill("patient123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();
    await expect(page).toHaveURL(`${BASE_URL}/appointments`);

    // Try to visit /dashboard directly
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveURL(`${BASE_URL}/dashboard`);
  });
});
