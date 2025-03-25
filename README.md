# Gmail2Drive

This repository contains two Google Apps Scripts:

## mail2markdown.gs Summary

This is a Google Apps Script to export emails from Gmail with the selected label to a specified folder as both markdown and PDF files. This was originally created to get AI meeting summaries out of my email and into Obsidian as markdown files. The styling for the markdown export has been based on emails from Fathom.ai, so may need adjustments if using a different service or if the emails have a different layout. Processed emails are marked with a "Processed" label to prevent duplicate processing.

## attachment2drive.gs Summary

This is a Google Apps Script to automatically save PDF attachments from Gmail emails with a specified label to a structured folder on Google Drive. It was created to handle recurring PDF attachments (like monthly invoices) by saving them with standardized names and organizing them by year. The script marks processed emails with a "Processed" label to prevent duplicate processing, and allows for flexible folder structures and file naming conventions.

---

## mail2markdown.gs

📌 Usage

1. Open Google Drive and create a folder named Meeting Summaries
2. Open Google Apps Script (https://script.google.com/)
3. Paste the contents of the code.gs file in the script window
4. Update the configuration variables at the top of the script:
   - `labelName`: The Gmail label to search for (use full path for nested labels, e.g., "Parent/Child Label")
   - `processedLabelName`: The label to mark processed emails (default: "Processed")
   - `mainFolderName`: The Google Drive folder to save to
   - `mdSubFolderName`: Subfolder for markdown files (default: "md")
   - `pdfSubFolderName`: Subfolder for PDF files (default: "pdf")
5. Save and run the script

---

📌 How It Works

- Scans Gmail for emails with the relevant label
- Creates a weekly folder inside the specified folder for each format
- Saves each email as a Markdown file and PDF file inside the correct weekly folder
- Marks processed emails with a "Processed" label
- Files are created with the following filename structure:
  - [EmailSubject][Date][EmailTimeStamp].md
- Folder Structure Example:

``` text
📂 Meeting Summaries/
   ├── 📂 md/            (Markdown files)
   │   ├── 📂 2025/
   │   │   ├── 📂 2025-Week-10/
   │   │   │   ├── Project_Update_2025-03-14_1430.md
   │   │   │   ├── Standup_Recap_2025-03-15_0900.md
   │
   ├── 📂 pdf/           (PDF files)
       ├── 📂 2025/
       │   ├── 📂 2025-Week-10/
       │   │   ├── Project_Update_2025-03-14_1430.pdf
       │   │   ├── Standup_Recap_2025-03-15_0900.pdf
```

---

## attachment2drive.gs

📌 Usage

1. Open Google Drive and create a folder for your attachments
2. Open Google Apps Script (https://script.google.com/)
3. Paste the contents of attachment2drive.gs in the script window
4. Update the configuration variables at the top of the script:
   - `labelName`: The Gmail label to search for (use full path for nested labels, e.g., "Parent/Child Label")
   - `processedLabelName`: The label to mark processed emails (default: "Processed")
   - `mainFolderName`: The Google Drive folder to save to
   - `subFolderName`: Optional subfolder (leave empty to save directly in main folder)
   - `fileNamePrefix`: Prefix for saved files (can be different from label)
5. Save and run the script

📌 Gmail Label Configuration

- For nested labels, specify the full path using forward slashes (/)
- Examples:
  - `"Invoices/Municipal"` for a label nested under "Invoices"
  - `"Work/2024/Receipts"` for a deeply nested label
- The script will create the "Processed" label at the root level, not nested

---

📌 How It Works

- Scans Gmail for emails with the specified label
- Creates a year-based folder structure
- Saves PDF attachments with standardized names
- Marks processed emails with a "Processed" label
- Files are created with the following filename structure:
  - [FileNamePrefix]_[YYYY]-[MM]-[DD].pdf
- Folder Structure Example:

``` text
📂 Municipal Invoices/
   ├── 📂 PDF/           (Optional subfolder)
   │   ├── 📂 2024/
   │   │   ├── Municipal_Invoice_2024-03-18.pdf
   │   │   ├── Municipal_Invoice_2024-03-19.pdf
   │
   📂 2023/              (If no subfolder specified)
      ├── Municipal_Invoice_2023-12-01.pdf
```

---

## Automation

📌 Automating the Google Apps Script

1. Click Run (▶) in Google Apps Script to test
2. Click Triggers (⏰) → Add Trigger:
3. Function to run: saveAIMeetingSummaryEmails or saveEmailAttachments
4. Choose event source: Time-driven
5. Type: Minutes/Hours/Days
6. Save changes

---

📌 Further Automation

- To automate copying files from Gdrive to a local folder, use rclone. This example copies only the markdown files to an existing Obsidian vault:
  - `rclone sync "gdrive:Meeting Summaries/md" "/Users/YOUR_USERNAME/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName/Meeting Summaries"`

- This can be automated by setting up a cron to run at a user-specified interval and generate logs:
  - `*/10 * * * * /usr/local/bin/rclone sync rclone sync "gdrive:Meeting Summaries/md" "/Users/YOUR_USERNAME/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName/Meeting Summaries" --progress >> ~/rsync_cron.log 2>&1`

---

📌 Choosing Between rclone Commands

- `rclone sync`: Creates an exact mirror of the Google Drive folder
  - Downloads new files from Google Drive
  - Deletes local files that no longer exist in Google Drive
  - Best for maintaining a perfect copy of the remote folder

- `rclone copy`: Downloads new files while preserving local changes
  - Downloads new files from Google Drive
  - Keeps local files that don't exist in Google Drive
  - Keeps local files that were deleted from Google Drive
  - Best for maintaining a local archive with additional files

---
