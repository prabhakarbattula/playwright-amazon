const { expect } = require('@playwright/test');

class ProductPage {
  constructor(page) {
    this.page = page;
    this.addToCartButton = page.locator('#desktop_qualifiedBuyBox').getByRole('button', { name: 'Add to Cart' })
    this.cartBadge = page.locator("#nav-cart-count");
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async validateCartCount(minCount = 1) {
    if (await this.page.getByRole('button', { name: 'Skip' }).isVisible({ timeout: 2000 }).catch(() => false)) {      
      await this.page.getByRole('button', { name: 'Skip' }).click()
      await this.page.waitForTimeout(3000)
    }    
    const count = parseInt(await this.cartBadge.innerText({timeout: 5000}));
    expect(count).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { ProductPage };
