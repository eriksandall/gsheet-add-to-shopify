/**
 * Add new spreadhsheet entries to Shopify.
 *
 * Functions to check the sheet for new addions, and create customer
 * accounts in a Shopify Store via Shopify API.
 *
 * @author Erik Sandall.
 */

function myWrapper() {
  /*
   * Wrapper function that calls the functions for adding new spreadsheet
   * additions to the Shopify store.
   *
   * @param {OBJECT} sheet        The Google Sheet listing all approved JPS signups
   * @param {ARRAY}  newAdditions Sheet row numbers of the new additions to the sheet
   */
  var Ss = SpreadsheetApp.openById('MY_SPREADSHEET_ID');
  var sheet = Ss.getSheetByName('MY_SHEET');

  // Check the sheet for new additions:
  var newAdditions = getNewAdditions(sheet);

  // If there are new additions, add them to Shopify:
  if (newAdditions.length > 0) {
    for (var i = 0; i < newAdditions.length; i++) {
      addShopifyCustomer(sheet, newAdditions[i]);
    }
  } else {
    Logger.log('No new additions right now!');
  }
}

function getNewAdditions(sheet) {
/*
 * Retieves row numbers of new additions to the sheet that haven't been added
 * to the store yet. Does this by checking for the length of the content in
 * the date column ('D'), and if empty, adds the index to an array.
 *
 * @param {STRING} column The index number of the column containing the date
                          when the entry was added to Shopify.
 * @param {OBJECT} dates  All values in the the date column ('D'), including
                          blank/empty values.
 *
 * @return {ARRAY} Row numbers of the new additions to the sheet
 */
  var colnum = 4; // Column 'D'
  try {
    var dates = sheet.getRange(1, colnum, sheet.getLastRow()).getValues();
  }
  catch (e) {
    Logger.log('Failed to check sheet for new additions: ' + e);
  }

  var rows = [];
  for (var i = 0; i < dates.length; i++) {
    if (dates[i] < 1) {
      rows.push(i + 1); // Add 1 because JS arrays start at 0 but GSheets rows start at 1
    }
  }
  return rows;
}

function addShopifyCustomer(sheet, row) {
/*
 * Adds new customers to the Shopify Store via Shopify API.
 *
 * @param {OBJECT} sheet    The Google Sheet of customers.
 * @param {NUMBER} row      The sheet row number for the new addition.
 * @param {OBJECT} customer First name, last name, and email of a new addition.
                            to the sheet.
 * @param {STRING} url      The Shopify store URL.
 * @param {STRING} api_key  The developer API key to access the Shopify store.
 * @param {JSON}   payload  Customer data that will be sent to Shopify to
                            create the customer account.
 */

  // Get customer data from the sheet:
  try {
    var customer = {
      firstname: sheet.getRange('A' + row).getValue(),
      lastname: sheet.getRange('B' + row).getValue(),
      email: sheet.getRange('C' + row).getValue()
    }
  }
  catch(e) {
    Logger.log('Failed to retrieve data from sheet: ' + e);
    return e; // Stop exection of the rest of the function
  }

  // Prep the payload:
  var payload = {
    'customer' : {
      'email' : customer.email,
      'first_name' : customer.firstname,
      'last_name' : customer.lastname
    }
  };

  // Set the URL and API key to interface with the Shopify store:
  var url = 'https://MY_STORE_NAME.myshopify.com';
  var api_key = 'MY_API_KEY';

  // First, check if the customer already exists in Shopify:
  try {
    var queryCust = UrlFetchApp.fetch(
      url + '/admin/api/2020-07/customers/search.json?query=email:' + customer.email,
      {
        'contentType' : 'application/json',
        'headers': {
          'Authorization' : 'Basic ' + Utilities.base64Encode(api_key)
        },
        'method' : 'get'
      }
    );
    var hasCustomer = JSON.parse(queryCust.getContentText());
  }
  catch (e) {
    Logger.log('Failed to check if customer exists in Shopify: ' + e);
    return; // Stop execution of the rest of the function.
  }

  // If customer doesn't exist, add them to Shopify:
  if (hasCustomer['customers'].length === 0) {
    try {
      var addCust = UrlFetchApp.fetch(
        url + '/admin/api/2020-07/customers.json',
        {
          'contentType' : 'application/json',
          'headers': {
            'Authorization' : 'Basic ' + Utilities.base64Encode(api_key)
          },
          'method' : 'post',
          'payload' : JSON.stringify(payload)
        }
      );
      var result = addCust.getContentText();
      Logger.log('Customer added to Shopify.');
      updateSheet(sheet, row);
    }
    catch (e) {
      Logger.log('Failed to add customer to Shopify: ' + e);
      return;
    }
  } else { // Customer already in Shopify; update the sheet:
    Logger.log('Customer already in Shopify.');
    updateSheet(sheet, row);
  }
}

function updateSheet(sheet, row) {
/*
 * Adds dates to the appropriate sheet column to indicate that entry was added
 * to Shopify.
 *
 * @param {OBJECT} sheet The Google Sheet of customers.
 * @param {NUMBER} row   The sheet row number for the new addition.
 * @param {STRING} today Today's date in mm/dd/yyyy format.
 */
  var date = new Date();
  var today = date.toLocaleDateString();

  // Update the sheet with the date the new entry was added to Shopify:
  try {
    var result = sheet.getRange('D' + row).setValue(today);
    Logger.log('Updated sheet.');
  }
  catch (e) {
    Logger.log('Failed to update sheet: ' + e);
    return e;
  }
}
