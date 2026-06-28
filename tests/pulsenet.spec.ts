import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Run tests serially since they form a stateful main loop
test.describe.configure({ mode: "serial" });

const timestamp = Date.now();
const citizenEmail = `citizen_${timestamp}@example.com`;
const responderEmail = `responder_${timestamp}@municipality.gov`;
const password = "Password123!";

test.describe("PulseNet E2E Test Suite", () => {
  // Set up mock geolocation before navigating
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
  });

  // ==============================================================================
  // 1. FUNCTIONAL E2E - CITIZEN REPORT
  // ==============================================================================
  test("Citizen Path: Register, login, report an issue in Ghost Mode", async ({ page }) => {
    // 1. Register a new Citizen (this automatically logs in and redirects to dashboard)
    const phoneSuffix = String(timestamp).slice(-4);
    await page.goto("/auth/register");
    await page.fill("#reg-username", `citizen_${timestamp}`);
    await page.fill("#reg-email", citizenEmail);
    await page.fill("#reg-phone", `+1 555-0${phoneSuffix}`);
    await page.fill("#reg-password", password);
    await page.fill("#reg-confirm", password);
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Verify redirected to citizen dashboard
    await page.waitForURL("**/citizen/dashboard");
    await expect(page.locator("aside").first()).toContainText("Citizen");

    // 2. Navigate to Report Page
    await page.click('a[href="/citizen/report"]');
    await page.waitForURL("**/citizen/report");

    // 4. Fill out the report form
    await page.selectOption('select:near(label:has-text("Issue Type"))', { label: "Pothole" });
    await page.selectOption('select:near(label:has-text("Severity"))', { label: "Medium" });
    await page.fill('input[placeholder="Auto-detecting address..."]', "Ward 42, Downtown Crossroad");
    
    // Upload dummy image evidence
    const dummyImage = Buffer.from("dummy-image-content");
    await page.setInputFiles('input[type="file"]', {
      name: "pothole.jpg",
      mimeType: "image/jpeg",
      buffer: dummyImage,
    });

    await page.fill('textarea[placeholder*="Describe the issue"]', `E2E Pothole issue description ${timestamp}`);

    // Toggle Ghost Mode (Post Anonymously)
    const ghostModeCheckbox = page.locator('input[type="checkbox"]');
    await ghostModeCheckbox.check();
    await expect(ghostModeCheckbox).toBeChecked();

    // Submit the form
    await page.click('button[type="submit"]:has-text("Submit Report")');

    // Verify redirect to community feed
    await page.waitForURL("**/citizen/feed");
    await expect(page.locator("body")).toContainText(`E2E Pothole issue description ${timestamp}`);
  });

  // ==============================================================================
  // 2. FUNCTIONAL E2E - RESPONDER CLAIM JOB
  // ==============================================================================
  test("Responder Path: Register, login, view Bounty Map, and claim open job", async ({ page }) => {
    // 1. Register a new Responder
    await page.goto("/auth/responder/register");
    await page.fill('input[placeholder="EMP-10294"]', `EMP-${timestamp}`);
    await page.fill('input[placeholder="Public Works"]', "Roads and Infrastructure");
    await page.fill('input[placeholder="Ward 42, Downtown"]', "Ward 42, Downtown");
    await page.fill('input[placeholder="worker@municipality.gov"]', responderEmail);
    await page.fill('input[placeholder="Min 6 chars"]', password);
    await page.click('button[type="submit"]:has-text("Apply for Access")');

    // Wait for redirect to dashboard
    await page.waitForURL("**/responder/dashboard");

    // 2. Locate the recently reported issue in the list & click it
    // Wait for tickets to load on the Bounty Map
    const ticketListItem = page.locator(`h3:has-text("Pothole")`).first();
    await expect(ticketListItem).toBeVisible();
    await ticketListItem.click();

    // 3. Verify modal details and click "Accept Job"
    const modal = page.locator("div.fixed.inset-0");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Pothole");
    await expect(modal).toContainText(`E2E Pothole issue description ${timestamp}`);

    await page.click('button:has-text("Accept Job")');

    // Modal should close and ticket should be removed from live open list
    await expect(modal).not.toBeVisible();
  });

  // ==============================================================================
  // 3. SECURITY & ANTI-CHEAT
  test("Security Path: Mock resolution anti-cheat and verify error feedback on fraud", async ({ page }) => {
    // Log in as the Responder
    await page.goto("/auth/responder/login");
    await page.fill('input[placeholder="worker@municipality.gov"]', responderEmail);
    await page.fill('input[placeholder="••••••••"]', password);
    await page.click('button[type="submit"]:has-text("Access Dashboard")');
    await page.waitForURL("**/responder/dashboard");

    // Navigate to Active Jobs (assuming there's a link or direct URL)
    await page.goto("/responder/jobs");
    await page.waitForURL("**/responder/jobs");

    // Click Submit Proof of Work
    await page.click('button:has-text("Submit Proof of Work")');
    await page.waitForTimeout(500); // Wait for React to attach event listeners

    // Set the browser mock flag for fraud detection
    await page.evaluate(() => {
      (window as any).__MOCK_RESOLVE_FRAUD__ = true;
    });

    await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const file = new File(['fake-resolved-image-data'], 'resolved.png', { type: 'image/png' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500); // Wait for state to propagate

    // Attempt to submit resolution
    await page.click('button[type="submit"]:has-text("Complete & Claim Bonus")');

    // Assert that the UI displays a red error banner and prevents submission
    const errorBanner = page.locator("div.bg-red-900\\/30");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Fraud detected");
  });

  // ==============================================================================
  // 4. ACCESSIBILITY (a11y)
  // ==============================================================================
  test("Accessibility Path: Run axe-core checks on Bento Grid Dashboard", async ({ page }) => {
    await page.goto("/");
    
    // Wait for the page content to fully load
    await page.waitForSelector("h1:has-text('PulseNet')");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast", "label"])
      .analyze();

    // Assert there are zero critical contrast or ARIA violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  // ==============================================================================
  // 5. RESPONSIVE LAYOUT
  // ==============================================================================
  test("Responsive Path: Ensure bento grid collapses to single column on mobile", async ({ page }) => {
    // Set viewport to iPhone 13 dimensions
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Wait for dashboard Bento cards to render
    const heroCard = page.locator('div.group:has(h1:has-text("PulseNet"))').first();
    const auditorCard = page.locator('div.group:has(h3:has-text("Gemini Auditor"))').first();

    await expect(heroCard).toBeVisible();
    await expect(auditorCard).toBeVisible();

    const heroBox = await heroCard.boundingBox();
    const auditorBox = await auditorCard.boundingBox();

    expect(heroBox).not.toBeNull();
    expect(auditorBox).not.toBeNull();

    if (heroBox && auditorBox) {
      // On mobile (single column), X coordinates should align and cards stack vertically
      expect(heroBox.x).toBeCloseTo(auditorBox.x, 15);
      expect(Math.abs(heroBox.width - auditorBox.width)).toBeLessThan(20);
      expect(heroBox.y + heroBox.height).toBeLessThan(auditorBox.y);
    }
  });
});
