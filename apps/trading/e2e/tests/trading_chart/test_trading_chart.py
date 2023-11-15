# import pytest
# import re
# from collections import namedtuple
# from playwright.sync_api import Page
# from vega_sim.service import VegaService
# from actions.vega import submit_order

# import logging

# logger = logging.getLogger()

# InfoItem = namedtuple('InfoItem', ['name', 'infoText'])

# @pytest.mark.skip("temporary skip")
# @pytest.mark.parametrize("vega", [120], indirect=True)
# @pytest.mark.usefixtures("continuous_market","risk_accepted", "auth")
# def test_trading_chart(continuous_market, vega: VegaService, page: Page):
#     page.goto(f"/#/markets/{continuous_market}")
#     vega.forward("24h")
#     vega.wait_for_total_catchup()
#     submit_order(vega, "mm", continuous_market, "SIDE_SELL", 1, 101.50000)
#     submit_order(vega, "mm2", continuous_market, "SIDE_SELL", 1, 101.50000)
#     vega.forward("10s")
#     vega.wait_for_total_catchup()


#     page.click("button[aria-haspopup='menu']:has-text('Interval:')")
#     page.click(f"div[role='menuitemradio']:text-is('15m')")
#     page.wait_for_selector(".indicator-info-wrapper:visible")
#     # Check chart views and select
#     chart = "[aria-label$='chart icon']"
#     valid_chart_views = ['Mountain', 'Candlestick', 'Line', 'OHLC']
#     #6004-CHAR-002
#     #6004-CHAR-003
#     check_menu_items(page, chart, valid_chart_views, 'Candlestick')

#     # Check study info
#     study_info = [
#         InfoItem("Eldar-ray","Eldar-ray: Bull -5.14286Bear -5.14286"),
#         InfoItem("Force index", "Force index: -0.85714"),
#         InfoItem("MACD", "MACD: S -0.09573D -0.38291MACD -0.47863"),
#         InfoItem("RSI", "RSI: 0.00000"),
#         InfoItem("Volume", "Volume: 1")
#     ]
#     """Preparation steps to check study info on the page."""
#     element = page.locator(".plot-area-interaction").nth(1)
#     element.hover()

#     page.click(".pane__close-button-wrapper")

#     info_items = page.query_selector_all(".plot-area")

#     assert (len(info_items)) == 1
#     #6004-CHAR-005
#     #6004-CHAR-006
#     #6004-CHAR-007
#     #6004-CHAR-042
#     #6004-CHAR-045
#     #6004-CHAR-047
#     #6004-CHAR-049
#     #6004-CHAR-051
#     page.mouse.wheel(0, 10)
#     check_menu_item_checkbox(page, "Studies", study_info)
#     page.get_by_text("Studies").click(force=True)


#     # Check overlay info
#     overlay_info = [
#         InfoItem("Bollinger bands", "Bollinger: Upper 110.69473Lower 103.10527"),
#         InfoItem("Envelope", "Envelope: Upper 111.65000Lower 91.35000"),
#         InfoItem("EMA", "EMA: 106.30000"),
#         InfoItem("Moving average", "Moving average: 106.90000"),
#         InfoItem("Price monitoring bounds", "Price Monitoring Bounds 1: Min 83.11038Max 138.66685Reference 107.50000")
#     ]
#     #6004-CHAR-004
#     #6004-CHAR-008
#     #6004-CHAR-009
#     #6004-CHAR-034
#     #6004-CHAR-037
#     #6004-CHAR-039
#     #6004-CHAR-041
#     check_menu_item_checkbox(page, "Overlays", overlay_info)

#  # Check chart info
#     # 6004-CHAR-010
#     expected_date_regex = r"^\d{2}:\d{2} \d{2} [A-Za-z]{3} \d{4}$"
#     expected_ohlc = "O 101.50000H 101.50000L 101.50000C 101.50000Change −6.00000(−5.58%)"
#     indicator_info_locator = page.locator(".indicator-info-wrapper").nth(0)
#     texts = indicator_info_locator.all_text_contents()
#     combined_text = ''.join(texts)
#     actual_date = combined_text[:-67]
#     actual_ohlc = combined_text[-67:]
#     logger.info(actual_date)
#     logger.info(actual_ohlc)
#     assert re.match(expected_date_regex, actual_date)
#     assert actual_ohlc == expected_ohlc
#      # Check interval options and select '15m'
#     interval = "button[aria-haspopup='menu']:has-text('Interval:')"
#     valid_intervals = ['1m', '5m', '15m', '1H', '6H', '1D']
#     #6004-CHAR-001
#     page.click("button[aria-haspopup='menu']:has-text('Interval:')", force=True)
#     check_menu_items(page, interval, valid_intervals, '1m')


# def check_menu_items(page, trigger_selector, valid_texts, click_item=None):
#     page.click(trigger_selector, force=True)
#     items = page.locator("div[role='menuitemradio']").all()
#     assert len(items) == len(valid_texts), f"Expected {len(valid_texts)} items but found {len(items)} items."

#     for i, el in enumerate(items):
#         text = el.text_content().strip()
#         assert text == valid_texts[i], f"Expected text '{valid_texts[i]}' but found '{text}'."
#     if click_item:
#         page.click(f"div[role='menuitemradio']:text-is('{click_item}')")
#         page.click(trigger_selector)
#         checked_item_text = page.text_content("div[role='menuitemradio'][data-state='checked']").strip()
#         assert checked_item_text == click_item, f"Expected checked item text '{click_item}' but found '{checked_item_text}'."
#     page.click(trigger_selector, force=True)

# def check_menu_item_checkbox(page, button_text, items):
#     button_selector = f"button:has-text('{button_text}')"

#     for item in items:
#         page.click(button_selector)
#         page.click(f"div[role='menuitemcheckbox']:has-text('{item.name}')")

#     page.click(button_selector)
#     checkbox_items = page.query_selector_all("div[role='menuitemcheckbox']")

#     assert len(checkbox_items) == len(items), f"Expected {len(items)} checkboxes but found {len(checkbox_items)}."

#     for i, el in enumerate(checkbox_items):
#         text = el.text_content().strip()
#         assert text == items[i].name, f"Expected checkbox text '{items[i].name}' but found '{text}'."

#     for i, item in enumerate(items[0:]):
#         info_locator = page.locator(".indicator-info-wrapper").nth(i+1)
#         info_text = info_locator.text_content().strip()
#         assert info_text == item.infoText, f"Expected info text '{item.infoText}' but found '{info_text}'."
