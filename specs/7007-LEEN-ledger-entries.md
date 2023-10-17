# Ledger entries

## Ledger entries tab in portfolio

When I enter on ledger entries tab in portfolio page

- **Must** see a form for download report file (<a name="7007-LEEN-001" href="#7007-LEEN-001">7007-LEEN-001</a>)
- in the form **Must** see a dropdown for select an asset, in which reports will be downloaded (<a name="7007-LEEN-002" href="#7007-LEEN-002">7007-LEEN-002</a>)
- in the form **Must** see inputs for select time period, in which reports will be downloaded (<a name="7007-LEEN-003" href="#7007-LEEN-003">7007-LEEN-003</a>)
- default preselected period **Must** be the last 7 days (<a name="7007-LEEN-004" href="#7007-LEEN-004">7007-LEEN-004</a>)
- **Must** see a note about time in file are in UTC and timezone of the user relative to UTC (<a name="7007-LEEN-006" href="#7007-LEEN-006">7007-LEEN-006</a>)
- As a user, I **must** see a message saying that this can take several minutes (<a name="7007-LEEN-007" href="#7007-LEEN-007">7007-LEEN-007</a>)
- After half a minute, the message is updated to say something like 'Still in progress' (<a name="7007-LEEN-008" href="#7007-LEEN-008">7007-LEEN-008</a>)
- A toast is shown when the download is complete (<a name="7007-LEEN-009" href="#7007-LEEN-009">7007-LEEN-009</a>)
- The download button should never be disabled
  - If user tries to download file which is already in download: (<a name="7007-LEEN-010" href="#7007-LEEN-010">7007-LEEN-010</a>)
    - if notification stayed open, nothing happens
    - If notification was closed, will be open, no any new request will be fired
    - If something has changed in the form (asset, dates, `Date.now`) new download will start.
- The state of the download form should be in sync with the download itself if you navigate away from the page or reload (<a name="7007-LEEN-011" href="#7007-LEEN-011">7007-LEEN-011</a>)
