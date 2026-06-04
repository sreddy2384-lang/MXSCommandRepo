Feature: Logix Add Well Filter

  Background:
    Given User is logged in to MAX Command
    And User navigates to homepage
    And User is on application homepage
    And Application should be fully loaded

  @HomepageLoad
  Scenario: Homepage loads successfully
    Then Application should be fully loaded

  @AddWellSort
  Scenario: Add Well dialog supports Run No sort toggle
    When openAddWellDialogue should be visible
    And toggleRunNoSortTwice should sort the list ascending then descending

  @AddWellFilter
  Scenario: Well ID filter shows only related rows after apply
    When openAddWellDialogue should be visible
    And user opens Well ID filter again and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Starts with" in second filter dropdown
    And user clicks Apply without changing first dropdown and textbox
    And only related wells should be displayed for selected filter
    

