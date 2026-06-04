Feature: Logix Add Well Filter

  Background:
    Given User is logged in to MAX Command

  # -----------------------------------------------------------------------
  @HomepageLoad
  Scenario: Homepage should be fully loaded with all UI elements
    When User navigates to homepage
    Then Application should be fully loaded
    And Logix Alert Management title should be visible
    And Navigation sidebar should be visible

  # -----------------------------------------------------------------------
  @AddWell
  Scenario: Add Well popup should display wellbore table with correct elements
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    And Wellbore table headers should be visible
    And Wellbore table should have data rows
    And Wellbore popup search input should be visible
    And Wellbore popup close button should be visible
    And Wellbore popup action button should be disabled when no well is selected

  # -----------------------------------------------------------------------
  @AddWell
  Scenario: User should be able to select a well and enable Add to Dashboard button
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User selects first well checkbox in popup
    Then Wellbore popup action button should be visible and enabled

  # -----------------------------------------------------------------------
  @AddWell
  Scenario: User should be able to close Wellbore popup
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User closes Wellbore popup
    Then Wellbore List popup should be closed

  # -----------------------------------------------------------------------
  @SearchWell
  Scenario: User should be able to search and add a well to dashboard
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks on Search Well input in popup
    And User searches well using RIGHIVE_WELL_NAME from env
    Then Searched well should be visible in popup results
    When User selects searched well checkbox in popup
    And User clicks Add to Dashboard button in popup
    Then Popup should close and same searched well should be displayed on dashboard

  # -----------------------------------------------------------------------
  @WellIDFilter
  Scenario: Well ID filter menu should display with default dropdown values
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks Well ID filter icon in popup
    Then Well ID filter popup should be displayed
    And Well ID filter dropdowns should be visible
    And Match All should be selected in first filter dropdown
    And Starts with should be selected in second filter dropdown

  # -----------------------------------------------------------------------
  @WellIDFilter
  Scenario: User should be able to apply Well ID filter and see filtered results
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks Well ID filter icon in popup
    Then Well ID filter popup should be displayed
    When User selects Match All in first filter dropdown
    And User selects Starts with in second filter dropdown
    And User enters well filter value from env in filter textbox
    And User clicks Apply in Well ID filter popup
    Then Filtered well rows should be displayed
    And Well ID filter should be applied

  # -----------------------------------------------------------------------
  @WellIDFilter
  Scenario: User should be able to switch filter condition to Contains
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks Well ID filter icon in popup
    Then Well ID filter popup should be displayed
    When User selects Contains in second filter dropdown
    And User clicks Apply in Well ID filter popup
    Then Well ID filter should be applied

  # -----------------------------------------------------------------------
  @WellIDFilter
  Scenario: User should be able to filter with numeric value 12
    When User navigates to homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks Well ID filter icon in popup
    Then Well ID filter popup should be displayed
    When User enters 12 in filter textbox and submits filter
    Then Filtered well rows should be displayed
