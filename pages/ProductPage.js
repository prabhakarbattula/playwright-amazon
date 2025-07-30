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
    const count = parseInt(await this.cartBadge.innerText());
    expect(count).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { ProductPage };
