Feature: Well Details Tab Flow

  Background:
    Given User is logged in to MAX Command
    And User navigates to homepage
    And User is on application homepage
    And Application should be fully loaded

  @WellDetailsTab
  Scenario: Well details tab work flow
    When user Click on well Details tab
    Then is navigates to the Well deatials tab
    And User search the search box Results should displayed
    And Clear the search go to cards click on Details button
    When the page navigates to Wells
    Then the data should be display
