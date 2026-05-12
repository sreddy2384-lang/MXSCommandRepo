@Max_CommandHomepage.feature
Feature: Logix Alert Management Application
  As a user
  I want to access and interact with the Logix Alert Management application
  So that I can manage alerts and well information

  Background:
    Given User is logged in to MAX Command
   
   @HomepageLoad
  Scenario: Verify application loads successfully
    When User navigates to homepage
    Then Application should be fully loaded
    And Logix Alert Management title should be visible
    And Navigation sidebar should be visible

  @AddWelltodashboard
  Scenario: Add well to dashboard from homepage
    Given User is on application homepage
    When User clicks on Add Well button
    Then Wellbore List popup should be displayed
    When User clicks on Search Well input in popup
    And User searches well using RIGHIVE_WELL_NAME from env
    Then Searched well should be visible in popup results
    When User selects searched well checkbox in popup
    And User clicks Add to Dashboard button in popup
    Then same searched well should be displayed on dashboard

    

    
