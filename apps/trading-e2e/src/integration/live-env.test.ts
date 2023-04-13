import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

const selectMarketOverlay = 'select-market-list';
const marketInfoBtn = 'Info';
const marketInfoSubtitle = 'accordion-title';
const marketSummaryBlock = 'header-summary';
const marketExpiry = 'market-expiry';
const marketPrice = 'market-price';
const marketChange = 'market-change';
const marketVolume = 'market-volume';
const marketMode = 'market-trading-mode';
const marketSettlement = 'market-settlement-asset';
const percentageValue = 'price-change-percentage';
const priceChangeValue = 'price-change';
const itemHeader = 'item-header';
const itemValue = 'item-value';
const marketListContent = 'popover-content';

test.describe('Console - market list - live env', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://console.fairground.wtf/');
  });

  test('shows the market list page', async ({ page }) => {
    await page.locator('main').waitFor({ timeout: 20000 });

    // Overlay should be shown
    await page.getByTestId(selectMarketOverlay).waitFor();
    await expect(
      page.getByText('Select a market to get started')
    ).toBeVisible();

    // I expect the market overlay table to contain at least one row
    expect(
      (await page.getByTestId(selectMarketOverlay).locator('table tr').all())
        .length
    ).toBeGreaterThan(1);

    // each market shown in overlay table contains content under the last price and change fields
    const prices = await page
      .getByTestId(selectMarketOverlay)
      .locator('table tr')
      .getByTestId('price')
      .all();
    prices.map(async (price) => await expect(price).not.toBeEmpty());
  });

  test('redirects to a default market', async ({ page }) => {
    await page.getByTestId('dialog-close').click();
    await expect(page.getByTestId(selectMarketOverlay)).toBeHidden();

    // the choose market overlay is no longer showing
    await expect(page.getByText('Select a market to get started')).toBeHidden();
    await expect(page.getByText('Loading...')).toBeHidden();
    await expect(page.getByTestId('popover-trigger')).not.toBeEmpty();
  });
});

test.describe('Console - market summary - live env', () => {
  const titles = ['Market data', 'Market specification', 'Market governance'];
  const subtitles = [
    'Current fees',
    'Market price',
    'Market volume',
    'Insurance pool',
    'Key details',
    'Instrument',
    'Settlement asset',
    'Metadata',
    'Risk model',
    'Risk parameters',
    'Risk factors',
    'Price monitoring bounds 1',
    'Liquidity monitoring parameters',
    'Liquidity',
    'Liquidity price range',
    'Oracle',
    'Proposal',
  ];
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://console.fairground.wtf/');
    await expect(page.getByText('Loading market data...')).toBeHidden();
    await expect(page.getByTestId('link').first()).toBeVisible();
    await page.getByTestId('dialog-close').click();
    await page.getByTestId(marketInfoBtn).click();
  });

  test('market info titles are displayed', async () => {
    const titlesElements = await page
      .getByTestId('split-view-view')
      .locator('.text-lg')
      .all();
    titlesElements.map(async (element, index) => {
      await expect(element).toHaveText(titles[index]);
    });
  });

  test('market info subtitles are displayed', async () => {
    await page.getByTestId('popover-trigger').click();
    await expect(page.getByText('Loading market data...')).toBeHidden();
    await page
      .locator('[data-testid="link"]', { hasText: 'AAVEDAI.MF21' })
      .click();
    await page.getByTestId(marketInfoBtn).click();
    const subtitlesElements = await page.getByTestId(marketInfoSubtitle).all();
    subtitlesElements.map(async (element, index) => {
      await expect(element).toHaveText(subtitles[index]);
    });
  });

  test('renders correctly liquidity in trading tab', async () => {
    await page.getByTestId('Liquidity').click();
    await expect(page.getByText('Loading')).toBeHidden();
    await expect(page.getByText('Something went wrong')).toBeHidden();
    await expect(page.getByText('Application error')).toBeHidden();
    await expect(
      page.getByTestId('tab-liquidity').locator('[col-id="party.id"]').nth(1)
    ).not.toBeEmpty();
  });
});

test.describe('Console - market summary - live env', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://console.fairground.wtf/');
    await page.getByTestId('dialog-close').click();
    await page.getByTestId(marketSummaryBlock).waitFor();
  });

  test('must display market name', async () => {
    await expect(page.getByTestId('popover-trigger')).not.toBeEmpty();
  });

  test('must see market expiry', async () => {
    const marketExpiryElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketExpiry);
    await expect(marketExpiryElement.getByTestId(itemHeader)).toHaveText(
      'Expiry'
    );
    await expect(marketExpiryElement.getByTestId(itemValue)).not.toBeEmpty();
  });

  test('must see market price', async () => {
    const marketPriceElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketPrice);
    await expect(marketPriceElement.getByTestId(itemHeader)).toHaveText(
      'Price'
    );
    await expect(marketPriceElement.getByTestId(itemValue)).not.toBeEmpty();
  });

  test('must see market change', async () => {
    const marketChangeElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketChange);
    await expect(marketChangeElement.getByTestId(itemHeader)).toHaveText(
      'Change (24h)'
    );
    await expect(
      marketChangeElement.getByTestId(percentageValue)
    ).not.toBeEmpty();
    await expect(
      marketChangeElement.getByTestId(priceChangeValue)
    ).not.toBeEmpty();
  });

  test('must see market volume', async () => {
    const marketVolumeElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketVolume);
    await expect(marketVolumeElement.getByTestId(itemHeader)).toHaveText(
      'Volume (24h)'
    );
    await expect(marketVolumeElement.getByTestId(itemValue)).not.toBeEmpty();
  });

  test('must see market mode', async () => {
    const marketModeElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketMode);
    await expect(marketModeElement.getByTestId(itemHeader)).toHaveText(
      'Trading mode'
    );
    await expect(marketModeElement.getByTestId(itemValue)).not.toBeEmpty();
  });

  test('must see market settlement', async () => {
    const marketSettlementElement = page
      .getByTestId(marketSummaryBlock)
      .getByTestId(marketSettlement);
    await expect(marketSettlementElement.getByTestId(itemHeader)).toHaveText(
      'Settlement asset'
    );
    await expect(
      marketSettlementElement.getByTestId(itemValue)
    ).not.toBeEmpty();
  });
});

test.describe('Console - markets table - live env', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://console.fairground.wtf/');
  });

  test('renders markets table', async ({ page }) => {
    const selectMarketRows = await page
      .getByTestId(selectMarketOverlay)
      .locator('table tr')
      .all();
    selectMarketRows.forEach(async (row) => {
      await expect(
        row.locator('[data-testid^="market-link-"]')
      ).not.toBeEmpty();
      await expect(row.getByTestId('price')).not.toBeEmpty();
      await expect(row.getByTestId('settlement-asset')).not.toBeEmpty();
      await expect(row.getByTestId('price-change-percentage')).not.toBeEmpty();
      await expect(row.getByTestId('price-change')).not.toBeEmpty();
      await expect(row.getByTestId('sparkline-svg')).toBeVisible();
    });
  });

  test('renders market list drop down', async ({ page }) => {
    await openMarketDropDown(page);
    const marketListContentRows = await page
      .getByTestId(marketListContent)
      .locator('table tr')
      .all();
    marketListContentRows.forEach(async (row) => {
      await expect(row.getByTestId('price')).not.toBeEmpty();
      await expect(row.getByTestId('trading-mode-col')).not.toBeEmpty();
      await expect(row.getByTestId('taker-fee')).not.toBeEmpty();
      await expect(row.getByTestId('market-volume')).not.toBeEmpty();
      await expect(row.getByTestId('market-name')).not.toBeEmpty();
    });
  });

  test('Able to select market from dropdown', async ({ page }) => {
    const marketName = await page.getByTestId('popover-trigger').textContent();
    await openMarketDropDown(page);
    await page.locator('[data-testid^="market-link-"]').nth(2).click();
    await expect(page.getByTestId('popover-trigger')).not.toHaveText(
      marketName as string
    );
  });
});

async function openMarketDropDown(page: Page) {
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
  await page.getByTestId('link').first().waitFor();
  await page.getByTestId('dialog-close').click();
  await page.getByTestId('popover-trigger').click();
  await page.getByText('Loading market data...').waitFor({ state: 'hidden' });
}
