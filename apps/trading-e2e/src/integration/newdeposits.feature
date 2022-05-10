Feature: deposits example with non approved wallet

  Scenario: Validation errors with random wallet
    Given I navigate to new deposits page
    And I update the form
    And I enter a valid amount
    Then Not approved message shown
