const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { SearchResultsPage } = require('../pages/SearchResultsPage');
const { ProductPage } = require('../pages/ProductPage');
const testData = require('../fixtures/testData.json');

const projects = [
  { name: 'Desktop-Chrome', use: { browserName: 'chromium' } },
  // { name: 'Desktop-Firefox', use: { browserName: 'firefox' } },
];

for (const project of projects) {
  test.describe.configure({ mode: 'serial' });

  test.describe(project.name, () => {
    test(`Verify end-to-end cart flow for all brands`, async ({ browser }) => {
      const context = await browser.newContext(project.use);
      const page = await context.newPage();

      const home = new HomePage(page);
      const search = new SearchResultsPage(page);

      await home.navigate(testData.baseUrl);
      await home.searchFor(testData.searchKeyword);
      await search.applyPriceFilter(testData.priceFilter.min, testData.priceFilter.max);
      await search.sortByPriceHighToLow() 

      for (const brand of testData.brands) {
        console.log(`\n--- Verifying brand: ${brand} ---`);        
        await search.applyBrandFilter(brand);
        await search.validateProductsWithinPriceRange(testData.priceFilter.min, testData.priceFilter.max);
      
        const { link } = await search.getFirstProduct();
        
        const newPage = await context.newPage();
        await newPage.goto(`${testData.baseUrl}${link}`);

        const product = new ProductPage(newPage);
        await product.addToCart();
        await product.validateCartCount();
        await newPage.close();        
        await page.reload();
      }

      await page.close();
      await context.close();
    });
  });
}
