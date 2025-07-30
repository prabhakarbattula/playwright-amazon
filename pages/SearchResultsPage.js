const { expect } = require('@playwright/test');

class SearchResultsPage {
  constructor(page) {
    this.page = page;
    
    this.brandCheckbox = (brand) => page.getByRole('link', { name: `Apply the filter ${brand} to` })
    this.minPriceInput = page.getByPlaceholder('Min');
    this.maxPriceInput = page.getByPlaceholder('Max');
    this.goButton = page.getByRole('button', { name: /Go/ });
    this.sortDropdown = page.getByRole('combobox', { name: /Sort by/ });  
    this.products = page.locator('[data-cy="asin-faceout-container"]');
  }  

  async applyBrandFilter(brand) {
    // 1. Clear previous selection if "Clear" appears
    const clearFilter = await this.page.locator('#brandsRefinements').getByRole('link', { name: 'Clear' });
    if (await clearFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`[BrandFilter] Clearing previous brand selection`);
      await clearFilter.click();    
    }

    // 2. Expand brand list if "See more" is available
    const seeMoreButton = await this.page.getByRole('button', { name: 'See more, Brands' });
    if (await seeMoreButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`[BrandFilter] Clicking "See more, Brands"`);
      await seeMoreButton.click();    
    }

    // 3. Apply the brand filter
    const checkbox = this.brandCheckbox(brand);
    console.log(`[BrandFilter] Applying brand: ${brand}`);
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    await checkbox.click();  
  }


  async applyPriceFilter(min, max) {
    const currentUrlString =  this.page.url(); 
    const currentUrl = new URL(currentUrlString);
    currentUrl.searchParams.set('low-price', min);
    currentUrl.searchParams.set('high-price', max);

    await this.page.goto(currentUrl.toString());
    await this.page.waitForSelector('[data-component-type="s-search-result"]');
  }

  async validateProductsWithinPriceRange(minPrice, maxPrice) {
    await this.page.waitForTimeout(3000)
    const productCount = await this.products.count();
    console.log(`[PriceCheck] Found ${productCount} products`);

    for (let i = 0; i < productCount; i++) {
      const product = this.products.nth(i);
      const priceElement = product.locator('.a-price-whole');

      // If price is missing (e.g. unavailable or ad), skip
      const isVisible = await priceElement.isVisible().catch(() => false);
      if (!isVisible) {
        console.warn(`[PriceCheck] Skipping product ${i + 1} — No visible price`);
        continue;
      }

      const priceText = await priceElement.innerText();
      const priceNumber = parseInt(priceText.replace(/[,₹]/g, ''), 10);

      if (isNaN(priceNumber)) {
        console.warn(`[PriceCheck] Skipping product ${i + 1} — Invalid price: ${priceText}`);
        continue;
      }

      if (priceNumber < minPrice || priceNumber > maxPrice) {
        throw new Error(`[PriceCheck ❌] Product ${i + 1} price ₹${priceNumber} is outside range ₹${minPrice}–₹${maxPrice}`);
      }

      console.log(`[PriceCheck ✅] Product ${i + 1}: ₹${priceNumber}`);
    }

    console.log(`[PriceCheck ✅] All visible products are within range ₹${minPrice}–₹${maxPrice}`);
  }


  async sortByPriceHighToLow() {
    await this.sortDropdown.selectOption('price-desc-rank');
    await this.page.waitForTimeout(3000)
  }  

  async getFirstProduct() {
    const firstProduct = this.products.first(); 
    const productLink = firstProduct.locator('a.a-link-normal').first()
    const href = await productLink.getAttribute('href');    

    return {
      element: firstProduct,
      link: href,
      price: await firstProduct.locator('.a-price-whole').innerText(),
    };
  }  
}

module.exports = { SearchResultsPage };