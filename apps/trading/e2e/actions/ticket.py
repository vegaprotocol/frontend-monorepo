from playwright.sync_api import Page

def select_mini(page: Page, button: str, dropdown_text: str):
    btn = page.get_by_test_id(button)
    control_id = btn.get_attribute('aria-controls')
    btn.click()
    page.locator('id=' + control_id).get_by_text(dropdown_text).click()
