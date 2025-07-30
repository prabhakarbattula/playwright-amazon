const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', { name: 'Search Amazon.in' });
    this.searchButton = page.getByRole('button', { name: 'Go', exact: true });
  }

  async navigate(url) {
    await this.page.goto(url);
    await expect(this.page).toHaveTitle(/Amazon/);
  }

  async searchFor(keyword) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }
}

module.exports = { HomePage };
