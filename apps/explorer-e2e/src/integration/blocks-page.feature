Feature: Blocks Page

  Scenario: Navigate to blocks page
    Given I am on the homepage
    When I navigate to the blocks page
    Then blocks page is correctly displayed

  Scenario: Navigate to blocks page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to the blocks page
    Then blocks page is correctly displayed

  Scenario: Navigate to block validator page
    Given I am on the homepage
    When I navigate to the blocks page
    And I click on top block
    Then validator block page is correctly displayed

  Scenario: Navigate to previous block
    Given I am on the homepage
    When I navigate to the blocks page
    And I click on top block
    Then I am on the previous block when I click previous

  Scenario: Previous button disabled on first block
    Given I am on the homepage
    When I navigate to the blocks page
    And jump to first block
    Then previous button is disabled
    And I am on the second block when I click next

  Scenario: Infinite scroll shows at least 300 new blocks
    Given I am on the homepage
    When I navigate to the blocks page
    And I scroll down to the last block on the page
    Then I can expect to see 150 blocks if i scroll 10 times