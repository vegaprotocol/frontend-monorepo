# Transfer

## Transfer Window

- **Must** be able to open transfer window through transfer button under key, account history page and collateral options (<a name="1003-TRAN-001" href="#1003-TRAN-001">1003-TRAN-001</a>)

- **Must** be able to close the window with the x (<a name="1003-TRAN-002" href="#1003-TRAN-002">1003-TRAN-002</a>)

- **Must** display a message showing obfuscated key that funds will be transferred from (<a name="1003-TRAN-003" href="#1003-TRAN-003">1003-TRAN-003</a>)

- **Must** each field has their label. Vega key, Asset, Amount (<a name="1003-TRAN-004" href="#1003-TRAN-004">1003-TRAN-004</a>)

## Vega Key

- **Must**
  if the user has multiple keys they must be able to swap between dropdown and manual entry (<a name="1003-TRAN-005" href="#1003-TRAN-005">1003-TRAN-005</a>)

- **Must**
  if the user has multiple keys they must be able to select from their list of keys(<a name="1003-TRAN-006" href="#1003-TRAN-006">1003-TRAN-006</a>)

## Asset

- **Must** display a drop down with all assets in the portfolio (<a name="1003-TRAN-007" href="#1003-TRAN-007">1003-TRAN-007</a>)

- **Must** the holdings of each asset is displayed (<a name="1003-TRAN-008" href="#1003-TRAN-008">1003-TRAN-008</a>)

- **Must** i can select any available assets and selected asset is displayed (<a name="1003-TRAN-009" href="#1003-TRAN-009">1003-TRAN-009</a>)

- **Must** selected asset shortname is displayed in the amount field (<a name="1003-TRAN-010" href="#1003-TRAN-010">1003-TRAN-010</a>)

## Validation

- **Must** cannot choose amount over current collateral. Message is displayed (<a name="1003-TRAN-011" href="#1003-TRAN-011">1003-TRAN-011</a>)

- **Must** display "required" message on each field if left blank when clicking button "Confirm Transfer" (<a name="1003-TRAN-012" href="#1003-TRAN-012">1003-TRAN-012</a>)

- **Must** display "Invalid vega key" message on Vega Key field if entered key doesn't pass validation(<a name="1003-TRAN-013" href="#1003-TRAN-013">1003-TRAN-013</a>)

- **Must** "Value below minimum" message is shown if amount is lower than minimum(<a name="1003-TRAN-014" href="#1003-TRAN-014">1003-TRAN-014</a>)

## Transfer

- **Must** can select include transfer fee (<a name="1003-TRAN-015" href="#1003-TRAN-015">1003-TRAN-015</a>)

- **Must** display tooltip for "Include transfer fee" when hovered over.(<a name="1003-TRAN-016" href="#1003-TRAN-016">1003-TRAN-016</a>)

- **Must** display tooltip for "Transfer fee when hovered over.(<a name="1003-TRAN-017" href="#1003-TRAN-017">1003-TRAN-017</a>)

- **Must** display tooltip for "Amount to be transferred" when hovered over.(<a name="1003-TRAN-018" href="#1003-TRAN-018">1003-TRAN-018</a>)

- **Must** display tooltip for "Total amount (with fee)" when hovered over.(<a name="1003-TRAN-019" href="#1003-TRAN-019">1003-TRAN-019</a>)

- **Must** amount to be transferred and transfer fee update correctly when include transfer fee is selected (<a name="1003-TRAN-020" href="#1003-TRAN-020">1003-TRAN-020</a>)

- **Must** total amount with fee is correct with and without "Include transfer fee" selected (<a name="1003-TRAN-021" href="#1003-TRAN-021">1003-TRAN-021</a>)

- **Must** i cannot select include transfer fee unless amount is entered (<a name="1003-TRAN-022" href="#1003-TRAN-022">1003-TRAN-022</a>)

- **Must** With all fields entered correctly, clicking "confirm transfer" button will start transaction(<a name="1003-TRAN-023" href="#1003-TRAN-023">1003-TRAN-023</a>)

### Transfer page

- Visiting the page with a query param `?assetId=XYZ` should load the page with that asset selected if that asset exists (<a name="1003-TRAN-024" href="#1003-TRAN-024">1003-TRAN-024</a>)
