Feature: Blocks Page

Scenario: Navigate to blocks page
  Given I am on the homepage
  When I navigate to the blocks page
  Then blocks page is correctly displayed

Scenario: Navigate to block validator page
  Given I am on the homepage
  When I navigate to the blocks page
  And I click on first block
  Then validator block page is correctly displayed
