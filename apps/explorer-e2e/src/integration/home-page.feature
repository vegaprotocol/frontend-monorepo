Feature: Home page

  Scenario: Stats page displayed correctly
    Given I am on the homepage
    Then the stats for deployed environment are correctly displayed

  Scenario Outline: Succesfful search for specific id by <IdType>
    Given I am on the homepage
    When I search for '<Id>'
    Then I am redirected to page containing id '<Id>'

    Examples:
      | IdType   | Id                                                                 |
      | Block Id | 973624                                                             |
      | Tx Hash  | 9ED3718AA8308E7E08EC588EE7AADAF49711D2138860D8914B4D81A2054D9FB8   |
      | Tx Id    | 0x61DCCEBB955087F50D0B85382DAE138EDA9631BF1A4F92E563D528904AA38898 |

  Scenario Outline: Error message displayed when invalid search by <invalidType>
    Given I am on the homepage
    When I search for '<Id>'
    Then search error message "<errorMessage>" is displayed

    Examples:
      | invalidType         | Id                                                               | errorMessage                   |
      | wrong string length | 9ED3718AA8308E7E08EC588EE7AADAF497D2138860D8914B4D81A2054D9FB8   | Something doesn't look right   |
      | invalid hash        | 9ED3718AA8308E7E08ECht8EE753DAF49711D2138860D8914B4D81A2054D9FB8 | Transaction is not hexadecimal |
      | empty search        |                                                                  | Search required                |
