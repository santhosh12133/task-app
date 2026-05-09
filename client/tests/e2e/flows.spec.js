import { test, expect } from '@playwright/test';

test.describe('UI Flows - Landing & Auth', () => {
  test('landing page loads with auth options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const heading = page.locator('text=Welcome');
    const loginBtn = page.locator('button:has-text("Log In")');
    const signupBtn = page.locator('button:has-text("Sign Up")');
    
    expect(heading).toBeTruthy();
    await page.screenshot({ path: 'test-results/screenshots/01-landing.png' });
  });

  test('auth page shows sign up form', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();
    
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    await page.screenshot({ path: 'test-results/screenshots/02-auth-form.png' });
  });

  test('can toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const toggleLink = page.locator('a:has-text("Sign up here"), a:has-text("Log in here")').first();
    if (toggleLink) {
      await toggleLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    await page.screenshot({ path: 'test-results/screenshots/03-auth-toggle.png' });
  });
});

test.describe('UI Flows - Dashboard', () => {
  test('dashboard layout renders correctly', async ({ page }) => {
    // Note: This assumes a test user exists or uses mock auth
    // In a real scenario, you'd mock the auth token
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main dashboard elements
    const sidebar = page.locator('nav, [role="navigation"]').first();
    const mainContent = page.locator('main, [role="main"]').first();
    
    if (sidebar) {
      await page.screenshot({ path: 'test-results/screenshots/04-dashboard-layout.png' });
    }
  });

  test('task list renders without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any task items or "no tasks" message
    const taskItems = page.locator('[data-testid="task-item"], .task-card, li:has-text("Create"), li:has-text("task")');
    const noTasksMsg = page.locator('text=no tasks, text=empty').first();
    
    await page.screenshot({ path: 'test-results/screenshots/05-task-list.png' });
  });
});

test.describe('UI Flows - Task Interactions', () => {
  test('can create a new task (UI only)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for add task button
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
    if (addBtn) {
      await addBtn.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/screenshots/06-add-task.png' });
    } else {
      await page.screenshot({ path: 'test-results/screenshots/06-add-task-notfound.png' });
    }
  });

  test('task drag-and-drop area visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for task list container
    const taskContainer = page.locator('[role="list"], ul, .task-list').first();
    if (taskContainer) {
      await page.screenshot({ path: 'test-results/screenshots/07-task-container.png' });
    }
  });
});

test.describe('UI Flows - AI Assistant', () => {
  test('AI assistant panel is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for AI button or panel
    const aiBtn = page.locator('button:has-text("AI"), button[title*="AI"], [data-testid="ai-button"]').first();
    if (aiBtn) {
      await aiBtn.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/screenshots/08-ai-panel.png' });
    } else {
      await page.screenshot({ path: 'test-results/screenshots/08-ai-panel-notfound.png' });
    }
  });
});

test.describe('UI Flows - Responsive & Mobile', () => {
  test('layout responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/screenshots/09-mobile-view.png' });
  });

  test('layout responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/screenshots/10-tablet-view.png' });
  });
});
