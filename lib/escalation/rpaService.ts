// lib/escalation/rpaService.ts

import puppeteer, { Browser } from "puppeteer";
import type { Ticket } from "./emailService";

/**
 * Runs an RPA flow that submits the ticket to a legacy government portal.
 *
 * Expected form fields on the portal (adjust selectors if the real portal differs):
 *   - #complaint-type   : select or input for ticket category
 *   - #description      : textarea for the description
 *   - #location         : input holding "lat,lng" string
 *   - #submit           : button to submit the form
 */
export async function runRpaEscalation(ticket: Ticket): Promise<boolean> {
  const portalUrl = process.env.LEGACY_PORTAL_URL ?? "https://legacy.gov.example.com/complaint";

  let browser: Browser | null = null;
  try {
    // Launch headless Chrome (or Chromium bundled with puppeteer)
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(portalUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Fill the form fields – adjust selectors as needed
    await page.waitForSelector("#complaint-type", { timeout: 10000 });
    // If the field is a select, we set its value; otherwise we type directly.
    const isSelect = await page.$eval(
      "#complaint-type",
      (el: any) => el.tagName.toLowerCase() === "select"
    ).catch(() => false);
    if (isSelect) {
      await page.select("#complaint-type", ticket.category);
    } else {
      await page.type("#complaint-type", ticket.category);
    }

    await page.type("#description", ticket.description);
    await page.type(
      "#location",
      `${ticket.lat},${ticket.lng}`
    );

    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click("#submit"),
    ]);

    // Basic success check – look for a confirmation element
    const success = await page
      .waitForSelector(".submission-success, .toast-success", { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    return success;
  } catch (err) {
    console.error("❌ RPA escalation failed:", err);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}
