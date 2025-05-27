import loadExistingNames from "./loadExistingNames";
import * as cheerio from "cheerio";
import puppeteer from 'puppeteer';
import saveNames from "./saveNames";

export async function getMaxPage(): Promise<number> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://deshimula.com/stories/1', { waitUntil: 'networkidle2' });
  
    // Wait for the pagination to appear
    await page.waitForSelector('.paginationjs-pages li');
  
    // Extract all the numeric page items:
    const pages: number[] = await page.$$eval(
      '.paginationjs-pages li:not(.paginationjs-prev):not(.paginationjs-next):not(.paginationjs-ellipsis)',
      els =>
        els
          .map(el => {
            const num = el.getAttribute('data-num') || el.textContent || '';
            return parseInt(num.trim(), 10);
          })
          .filter(n => !isNaN(n))
    );
  
    await browser.close();
    return pages.length ? Math.max(...pages) : 1;
  }

export default async function scrapeCompanyNames() {
  const baseUrl = "https://deshimula.com";
  const storiesBaseUrl = `${baseUrl}/stories/`;
  const companyNames = await loadExistingNames();
  let newNamesFound = 0;

  // 1) Fetch the first stories page to discover how many pages there are
  const firstPageUrl = `${storiesBaseUrl}1`;
  const resp = await fetch(firstPageUrl);
  const firstHtml = await resp.text();
  const $$ = cheerio.load(firstHtml);

  // 2) Select only the numbered page items, ignore “…” and prev/next
  const pageItems = $$(".paginationjs-pages li:not(.paginationjs-prev):not(.paginationjs-next):not(.paginationjs-ellipsis)");
  const maxPages = await getMaxPage();

  console.log(`Found ${maxPages} total pages to scrape`);

  // 3) Loop through all pages
  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`Scraping page ${page} …`);
      const url = `${storiesBaseUrl}${page}`;
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      let pageNew = 0;
      $("span.company-name").each((_, el) => {
        const name = $(el).text().trim();
        if (name && !companyNames.has(name)) {
          companyNames.add(name);
          pageNew++;
          newNamesFound++;
        }
      });

      if (pageNew > 0) {
        await saveNames(companyNames);
      }

      // be kind to their server
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Error on page ${page}:`, err);
      await saveNames(companyNames);
      throw err;
    }
  }

  console.log("Scraping completed!");
  console.log(`Total unique names: ${companyNames.size}`);
  console.log(`New names this run: ${newNamesFound}`);
}
