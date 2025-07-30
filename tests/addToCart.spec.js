// // File: tests/amazon/addToCart.spec.js

const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { SearchResultsPage } = require('../pages/SearchResultsPage');
const { ProductPage } = require('../pages/ProductPage');
const testData = require('../fixtures/testData.json');

test.describe.configure({ mode: 'serial' });

test.describe('End-to-End Cart Flow for All Brands', () => {
  test(`Verify cart functionality for each brand`, async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const home = new HomePage(page);
    const search = new SearchResultsPage(page);

    await home.navigate(testData.baseUrl);
    await home.searchFor(testData.searchKeyword);
    await search.applyPriceFilter(testData.priceFilter.min, testData.priceFilter.max);
    await search.sortByPriceHighToLow();

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
