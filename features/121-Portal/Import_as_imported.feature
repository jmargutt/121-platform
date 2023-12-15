@portal
Feature: Import registrations as imported

  Background:
    Given a logged-in user with the "RegistrationCREATE" and "RegistrationImportTemplateREAD" permissions
    Given the "selected phase" is "Registration (& Validation)"

  Scenario: Download template for import
    Given the user clicks the "Import People Affected" button
    When the user clicks the "Download template CSV-file" button
    Then a CSV-file is downloaded
    And it contains 1 row of column names
    And it contains the column "phoneNumber"
    And it contains the column "preferredLanguage"
    And the dynamic "programCustomAttributes" of that program

    When the program is not configured with a paymentAmountMultiplierFormula
    Then it contains the column "paymentAmountMultiplier" after the column "phoneNumber"

    When the program has scope enabled
    Then it contains the column scope

  Scenario: Successfully Import People Affected
    Given a valid import CSV file is prepared
    Given - if program and user have a scope - the file only contains records within the scope of the user
    And it has columns "phoneNumber", and "paymentAmountMultiplier" and "preferredLanguage"
    And the dynamic "programCustomAttributes" of that program
    And it has as delimiter ";" or ","
    And the "paymentAmountMultiplier" column has only positive integers as values
    Given the user clicks the "Import People Affected" button
    When the user selects the CSV-file, through 'choose file' or 'drag and drop'
    Then the "OK" button becomes enabled

    When the user clicks "OK" to confirm the import
    Then a loading spinner appears

    When it is finished
    Then a feedback popup appears
    And it shows the number of successfully imported "phoneNumbers"
    And it shows the number of "phoneNumbers" that were already present in the system
    And it shows the number of invalid "phoneNumbers"
    And it shows an "OK" button
    And it mentions that a CSV is automatically downloaded with the import-result per row.
    And a download window for this CSV is appearing
    And the CSV contains the following columns "phoneNumber", "paymentAmountMultiplier", "preferredLanguage" a column per custom attribute in the program, "importStatus", "registrationStatus"

    When the users clicks "OK" on the popup
    Then the popup disappears
    And the page refreshes
    And the PA-table now shows new rows equal to the number of successfully imported "phoneNumbers"
    And they have status "Imported"
    And the Imported date is filled in
    And "Messages" shows "No messages yet"

  Scenario: Unsuccessfully import invalid CSV file
    Given the user clicks the "Import People Affected" button
    When the user selects an invalid CSV-file (wrong extension, wrong column names, wrong delimiter, wrong input values, records with a scope outside of the user, etc.)
    Then the "OK" button becomes enabled
    When the user clicks "OK" to confirm the import
    Then a feedback popup appears that "Something went wrong with the import" and it explains possible reasons