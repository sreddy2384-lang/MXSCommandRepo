Feature: Logix Add Well Filter

  Background:
    Given User is logged in to MAX Command
    And User navigates to homepage
    And User is on application homepage
    And Application should be fully loaded

  @HomepageLoad
  Scenario: Homepage loads successfully
    Then Application should be fully loaded

  @WellIdFlow
  Scenario: Well ID full flow validation
    When openAddWellDialogue should be visible
    And toggle "Well ID" sort twice should sort the list ascending then descending
    And user opens Well ID filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Starts with" in second filter dropdown
    And user fills third textbox with test data for "Well ID"
    And user clicks Apply button for current filter
    And only related wells should be displayed for selected filter
    And user clears "Well ID" filter

  @LastEditedByFlow
  Scenario: Last Edited By full flow validation
    When openAddWellDialogue should be visible
    And toggle "Last Edited By" sort twice should sort the list ascending then descending
    And user opens "Last Edited By" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Last Edited By"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Last Edited By"
    And user clears "Last Edited By" filter

  @RigNameFlow
  Scenario: Rig Name full flow validation
    When openAddWellDialogue should be visible
    And toggle "Rig Name" sort twice should sort the list ascending then descending
    And user opens "Rig Name" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Rig Name"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Rig Name"
    And user clears "Rig Name" filter

  @LatitudeFlow
  Scenario: Latitude full flow validation
    When openAddWellDialogue should be visible
    And toggle "Latitude" sort twice should sort the list ascending then descending
    And user opens "Latitude" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Latitude"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Latitude"
    And user clears "Latitude" filter

  @LongitudeFlow
  Scenario: Longitude full flow validation
    When openAddWellDialogue should be visible
    And toggle "Longitude" sort twice should sort the list ascending then descending
    And user opens "Longitude" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Longitude"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Longitude"
    And user clears "Longitude" filter

  @CountryFlow
  Scenario: Country full flow validation
    When openAddWellDialogue should be visible
    And toggle "Country" sort twice should sort the list ascending then descending
    And user opens "Country" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Country"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Country"
    And user clears "Country" filter

  @RegionFlow
  Scenario: Region full flow validation
    When openAddWellDialogue should be visible
    And toggle "Region" sort twice should sort the list ascending then descending
    And user opens "Region" filter and waits for popup
    And user verifies first filter dropdown shows Match All
    And user selects "Contains" in second filter dropdown
    And user fills third textbox with test data for "Region"
    And user clicks Apply button for current filter
    And only related rows should be displayed for selected filter in "Region"
    And user clears "Region" filter

  @AddWellToDashboard
  Scenario: Add well to dashboard work flow
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user opens Information tab
    Then Basic Information section should be displayed with details
    And Network Connection section should be displayed with details
    And Location section should be displayed with details
    And Remote Connection section should be displayed with details

  @OverviewTab
  Scenario: Overview tab Next Well navigation should change the displayed well
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user notes the current well name on Overview tab
    And user clicks Next Well button
    Then a different well should be displayed on Overview tab

  @ThreeDotsWellDetails
  Scenario: Three dots popup and Well Details option validation
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user clicks on 3 dots menu
    Then 3 dots popup should be displayed
    When user clicks on Well Details from popup

  @AlertsTab
  Scenario: Alerts tab should show alerts or no active alerts message
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user opens Alerts tab
    Then Alerts tab should show alerts or no active alerts message

  @AdditionalMetricsTab
  Scenario: Additional Metrics tab should show metrics or empty state
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user opens Additional Metrics tab
    Then Additional Metrics tab should show metrics or no data message

  @NotificationTabs
  Scenario: Notification tabs should show data or empty state
    When openAddWellDialogue should be visible
    And user selects well "NEW12030" from the Wellbore List
    And user clicks on Update Dashboard
    Then selected well "NEW12030" should be displayed on Dashboard
    And User verifies that dashboard cards are displayed
    When user clicks Expand Well Details button on dashboard card
    Then expanded well details should be displayed
    When user opens "All Alerts" notification tab
    Then "All Alerts" notification tab should show notifications or empty state message
    When user opens "Unacknowledged" notification tab
    Then "Unacknowledged" notification tab should show notifications or empty state message
    When user opens "Acknowledged" notification tab
    Then "Acknowledged" notification tab should show notifications or empty state message
    
