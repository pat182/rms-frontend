import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {

  test('successful login', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/login');

    await page.getByPlaceholder('Email Address').fill('thebackdoors182@gmail.com');
    await page.getByPlaceholder('Password').fill('test123!@#');

    await page.getByRole('button', { name: 'Login' }).click();

    // Verify user left login page
    await expect(page).not.toHaveURL(/login/);

    // Verify dashboard loads
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
  });

  test('invalid login', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/login');

    await page.getByPlaceholder('Email Address').fill('asdasdasd@gmail.com');
    await page.getByPlaceholder('Password').fill('test123!@#');

    await page.getByRole('button', { name: 'Login' }).click();

    // Verify still on login page
    await expect(page).toHaveURL(/login/);

    // Verify error appears
    await expect(
      page.getByText('Invalid credentials')
    ).toBeVisible();
  });

  
});
