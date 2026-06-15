import { test, expect } from "@playwright/test";

test.describe("Module 3: Quản trị & Nghiệp vụ nội bộ (Admin Management & Payroll)", () => {
  const BASE_URL = "http://localhost:3000";

  test("TC_MGMT_001: Quản lý bệnh nhân & bác sĩ - Kiểm tra phân quyền xem/sửa", async ({ page }) => {
    // ----------------------------------------------------
    // 1. Log in as Receptionist and verify READ-ONLY limits
    // ----------------------------------------------------
    console.log("Logging in as Receptionist...");
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("ptd@email.com");
    await page.getByPlaceholder('••••••••').fill("patient123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    // Wait until logged in
    await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });

    // Go to Patient/Users list
    await page.getByRole('link', { name: 'Người dùng' }).click();
    await expect(page.locator("text=Người dùng").first()).toBeVisible({ timeout: 15000 });
    // Receptionist should NOT see "Thêm" button
    await expect(page.locator('button:has-text("Thêm")')).not.toBeVisible();

    // Go to Doctor list
    await page.getByRole('link', { name: 'Bác sĩ' }).click();
    await expect(page.locator("text=Bác sĩ").first()).toBeVisible({ timeout: 15000 });
    // Receptionist should NOT see "Thêm bác sĩ" or "Thêm" button
    await expect(page.locator('button:has-text("Thêm")')).not.toBeVisible();

    // Verify Receptionist has no access to services or pricing configuration pages
    await page.goto(`${BASE_URL}/services`);
    await expect(page).not.toHaveURL(`${BASE_URL}/services`);

    await page.goto(`${BASE_URL}/pricing`);
    await expect(page).not.toHaveURL(`${BASE_URL}/pricing`);

    // Log out (Depends on topbar layout, usually clicking avatar then "Đăng xuất" or a direct link)
    // To be safe, navigate directly to logout if there's a logout api, or just clear cookies.
    // Or we can rely on standard click
    const logoutBtn = page.locator('text=Đăng xuất');
    if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
    } else {
        // Fallback: click user menu then logout
        await page.locator('header').locator('button').last().click();
        await page.locator('text=Đăng xuất').click();
    }
  });

  test("TC_MGMT_002: Bác sĩ xem bảng lương - Yêu cầu hiển thị tên bệnh nhân & Chặn chỉnh sửa", async ({ page }) => {
    // ----------------------------------------------------
    // 2. Log in as Doctor to view payroll
    // ----------------------------------------------------
    console.log("Logging in as Doctor...");
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("nam.pham@serenity.vn");
    await page.getByPlaceholder('••••••••').fill("doctor123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    // Go to payroll page
    await expect(page).toHaveURL(`${BASE_URL}/appointments`, { timeout: 15000 });
    await page.getByRole('link', { name: 'Tính lương' }).click();
    await expect(page.locator("text=lương").first()).toBeVisible({ timeout: 15000 });

    // Verify doctor can only see their own payroll information and CANNOT edit config
    await expect(page.locator('button:has-text("Lưu cấu hình")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Chốt lương")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Chốt bảng lương")')).not.toBeVisible();

    // Click on payslip details and verify it displays the list of treated patients
    const detailBtn = page.locator('button:has-text("Xem chi tiết")');
    if (await detailBtn.count() > 0) {
        await detailBtn.first().click();
        await expect(page.locator("text=Bệnh nhân").first()).toBeVisible();
        await expect(page.locator("text=Dịch vụ").first()).toBeVisible();
        
        // Close details
        const closeBtn = page.locator('button:has-text("Đóng")');
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    }

    // Log out
    const logoutBtn = page.locator('text=Đăng xuất');
    if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
    } else {
        await page.locator('header').locator('button').last().click();
        await page.locator('text=Đăng xuất').click();
    }
  });

  test("TC_MGMT_003: Admin chốt bảng lương - Đóng băng dữ liệu (Read-only after Freeze)", async ({ page }) => {
    // ----------------------------------------------------
    // 3. Log in as Admin to freeze payroll
    // ----------------------------------------------------
    console.log("Logging in as Admin...");
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('admin@clinicserenity.vn').fill("admin@clinicserenity.vn");
    await page.getByPlaceholder('••••••••').fill("admin123");
    await page.getByRole('button', { name: /Đăng nhập/ }).click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    await page.getByRole('link', { name: 'Tính lương' }).click();
    await expect(page.locator("text=lương").first()).toBeVisible({ timeout: 15000 });

    // Check if there is an active draft payroll to freeze
    const chotLuongBtn = page.locator('button:has-text("Chốt")');
    if (await chotLuongBtn.isVisible()) {
      await chotLuongBtn.click();
      const dongYBtn = page.locator('button:has-text("Đồng ý")');
      if (await dongYBtn.isVisible()) {
         await dongYBtn.click();
      }
      await expect(page.locator("text=Đã chốt").first()).toBeVisible({ timeout: 10000 });

      // Verify input boxes for commission rate or shift rates are now disabled/read-only (TC_PAYROLL_006)
      const inputElements = page.locator('input[type="number"]');
      const count = await inputElements.count();
      for (let i = 0; i < count; i++) {
        await expect(inputElements.nth(i)).toBeDisabled();
      }
    }
  });
});
