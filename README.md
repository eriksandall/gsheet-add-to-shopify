# GSheets Add Customer to Shopify

This script checks a given sheet for new entries, and adds them as customers to Shopify if they don't already exist in Shopify.

## Try it

1. Create a Google spreadsheet with _first name_ in column 'A', _last name_ in column 'B', _email address_ in column 'C', and _date_ in column 'D'.
1. Click **Tools** > **Script Editor**. This brings you to the _Apps Script editor._
1. Copy the contents of `src/Code.js` and paste into the script editor.
1. Change `MY_SPREADSHEET_ID`, `MY_SHEET`, `MY_STORE_NAME`, and `MY_API_KEY` as appropriate.
1. Save the script.
1. Run the script to trigger permissions approval, even if your spreadsheet is blank: Click **Run** > **Run Function** > **myWrapper**.
1. When prompted, click **Review permissions** and **Allow**. You will only need to do this once.
   
   > If you get a warning that **This app isn't verified** continue
   > with the verification process by clicking **Advanced** and
   > then scroll down and click the grey text at the bottom that
   > says **Go to (Copy this) Script to send content**
1. After granting permission, repeat **Step 6** whenever you have new entries in your sheet. Alternately, you can create a Trigger to have the script run automatically.
