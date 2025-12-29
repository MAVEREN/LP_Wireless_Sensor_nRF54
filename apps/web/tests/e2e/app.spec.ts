import { test, expect } from '@playwright/test';

test.describe('Topology Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/topology');
  });

  test('should display topology page', async ({ page }) => {
    await expect(page.locator('h4:has-text("Organizations")')).toBeVisible();
    await expect(page.locator('h4:has-text("Sites")')).toBeVisible();
    await expect(page.locator('h4:has-text("SensorGroups")')).toBeVisible();
  });

  test('should create a new organization', async ({ page }) => {
    // Click create organization button
    await page.locator('button:has-text("Create Organization")').click();
    
    // Fill form
    await page.locator('input[name="name"]').fill('Test Organization');
    await page.locator('input[name="contactEmail"]').fill('test@example.com');
    
    // Submit
    await page.locator('button:has-text("Create")').click();
    
    // Verify organization appears in list
    await expect(page.locator('text=Test Organization')).toBeVisible();
  });

  test('should navigate through hierarchy', async ({ page }) => {
    // Select an organization
    const orgCard = page.locator('.MuiCard-root').first();
    await orgCard.click();
    
    // Sites panel should update
    await expect(page.locator('h5:has-text("Sites for")')).toBeVisible();
  });
});

test.describe('Fleet Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/fleet');
  });

  test('should display fleet dashboard', async ({ page }) => {
    await expect(page.locator('h4:has-text("Fleet Dashboard")')).toBeVisible();
    await expect(page.locator('text=Total Nodes')).toBeVisible();
    await expect(page.locator('text=Active Nodes')).toBeVisible();
  });

  test('should display nodes table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Node Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Battery")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should auto-refresh data', async ({ page }) => {
    // Enable auto-refresh
    await page.locator('button:has-text("Auto Refresh")').click();
    
    // Wait for refresh interval
    await page.waitForTimeout(6000);
    
    // Data should be refreshed (check for loading state)
    await expect(page.locator('.MuiCircularProgress-root')).toBeVisible({ timeout: 1000 });
  });
});

test.describe('Local Mode E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant Web Bluetooth permissions
    await context.grantPermissions(['bluetooth']);
    await page.goto('http://localhost:5173/local');
  });

  test('should display local mode page', async ({ page }) => {
    await expect(page.locator('h4:has-text("Local Mode")')).toBeVisible();
    await expect(page.locator('text=Web Bluetooth')).toBeVisible();
  });

  test('should show commissioning options', async ({ page }) => {
    await expect(page.locator('button:has-text("Commission Node")')).toBeVisible();
    await expect(page.locator('button:has-text("Commission Hub")')).toBeVisible();
  });

  test('should navigate to node commissioning', async ({ page }) => {
    await page.locator('button:has-text("Commission Node")').click();
    await expect(page.url()).toContain('/commission/node');
    await expect(page.locator('text=Connect Device')).toBeVisible();
  });
});

test.describe('Commissioning Wizard E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['bluetooth']);
    await page.goto('http://localhost:5173/commission/node');
  });

  test('should display commissioning wizard', async ({ page }) => {
    await expect(page.locator('text=Connect Device')).toBeVisible();
    await expect(page.locator('.MuiStepper-root')).toBeVisible();
  });

  test('should show all wizard steps', async ({ page }) => {
    await expect(page.locator('text=Connect Device')).toBeVisible();
    await expect(page.locator('text=Device Info')).toBeVisible();
    await expect(page.locator('text=Select Location')).toBeVisible();
    await expect(page.locator('text=Configure')).toBeVisible();
    await expect(page.locator('text=Complete')).toBeVisible();
  });

  test('should have next button disabled on first step', async ({ page }) => {
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
  });
});

test.describe('Navigation E2E Tests', () => {
  test('should navigate between all pages', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Home page
    await expect(page.locator('h3:has-text("Industrial Sensor Network")')).toBeVisible();
    
    // Local mode
    await page.locator('a[href="/local"]').click();
    await expect(page.url()).toContain('/local');
    
    // Remote mode
    await page.locator('a[href="/remote"]').click();
    await expect(page.url()).toContain('/remote');
    
    // Topology
    await page.locator('a[href="/topology"]').click();
    await expect(page.url()).toContain('/topology');
    
    // Fleet
    await page.locator('a[href="/fleet"]').click();
    await expect(page.url()).toContain('/fleet');
  });
});
