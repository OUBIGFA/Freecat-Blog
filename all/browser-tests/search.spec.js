const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\//, route => route.abort());
});

test('header preview stays bounded and view all shows every keyword match', async ({ page }) => {
    const posts = Array.from({ length: 30 }, (_, index) => ({
        title: `Search fixture ${index + 1}`, excerpt: 'Search fixture', content: '', tags: [],
        date: '2026-01-01', link: `/posts/search-fixture-${index + 1}/`
    }));
    await page.route('**/search-index.json', route => route.fulfill({ json: posts }));
    await page.goto('/');
    await page.locator('#search-toggle').click();
    await page.locator('#search-input').fill('Search fixture');
    await expect(page.locator('#search-results-overlay .post-card')).toHaveCount(20);
    await page.getByRole('link', { name: '查看全部' }).click();
    const content = page.frameLocator('#freecat-content-frame');
    await expect(content.locator('#search-results .post-card')).toHaveCount(30);
    await expect(content.locator('.freecat-results-count-value')).toHaveText('30');
});

test('reopening search during its closing animation keeps the input usable', async ({ page }) => {
    await page.goto('/');
    // Control the closing timer so the test covers the race without depending on machine speed.
    await page.clock.install();
    await page.locator('#search-toggle').click();
    await page.clock.runFor(400);
    await page.locator('#search-input').press('Escape');
    await page.locator('#search-toggle').click();
    await page.clock.runFor(500);
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('#search-container')).toHaveAttribute('data-open', 'true');
    await page.locator('#search-input').fill('Markdown');
    await page.clock.runFor(250);
    await expect(page.locator('#search-results-overlay .post-card').first()).toBeVisible();
    await page.locator('#search-input').press('Escape');
    await page.clock.runFor(500);
    await expect(page.locator('#search-input')).toBeHidden();
});

test('search and theme controls remain usable when browser storage is denied', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        for (const name of ['localStorage', 'sessionStorage']) {
            Object.defineProperty(window, name, {
                get() { throw new DOMException('Storage access denied', 'SecurityError'); }
            });
        }
    });
    await page.goto('/');
    const wasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    await page.locator('#theme-toggle').click();
    await expect.poll(() => page.locator('html').evaluate(el => el.classList.contains('dark'))).toBe(!wasDark);
    await page.locator('#search-toggle').click();
    await page.locator('#search-input').fill('Markdown');
    await expect(page.locator('#search-results-overlay .post-card').first()).toBeVisible();
    await page.locator('#search-results-overlay .post-card').first().click();
    await expect(page.frameLocator('#freecat-content-frame').locator('article h1')).toBeVisible();
    expect(errors).toEqual([]);
});
