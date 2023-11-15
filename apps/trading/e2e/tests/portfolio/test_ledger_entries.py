import os
import pytest
from playwright.sync_api import Page, expect

from actions.utils import wait_for_toast_confirmation

@pytest.mark.usefixtures("page", "auth", "risk_accepted", "continuous_market")
def test_ledger_entries_downloads(page: Page):
    page.goto("/#/portfolio")
    page.get_by_test_id("Ledger entries").click()
    expect(page.get_by_test_id("ledger-download-button")).to_be_enabled()
    # 7007-LEEN-001
    page.get_by_test_id("ledger-download-button").click()
    #7007-LEEN-009
    expect(page.get_by_test_id("toast-content")).to_contain_text(("Your file is ready"))
    # Get the user's Downloads directory
    downloads_directory = os.path.expanduser("~") + "/Downloads/"
    # Start waiting for the download
    with page.expect_download() as download_info:
    # Perform the action that initiates download
        page.get_by_role("link", name="Get file here").click()


    download = download_info.value
    # Wait for the download process to complete and save the downloaded file in the Downloads directory
    download.save_as(os.path.join(downloads_directory, download.suggested_filename))

    # Verify the download by asserting that the file exists
    downloaded_file_path = os.path.join(downloads_directory, download.suggested_filename)
    assert os.path.exists(downloaded_file_path), f"Download failed! File not found at: {downloaded_file_path}"

