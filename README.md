# Gmail2Drive

This repository provides two Google Apps Scripts designed to automate the extraction and organisation of content from Gmail to Google Drive. The first script (`mail2markdown.gs`) converts AI meeting summary emails into markdown and PDF files, making them easily accessible in note-taking applications like Obsidian. The second script (`attachment2drive.gs`) manages recurring PDF attachments (such as invoices or receipts) by automatically saving them to Google Drive with standardised names and year-based organisation. Both scripts use Gmail labels to track processed emails and can be automated to run at regular intervals.

## Table of Contents

1. [Summaries](#1-summaries)
   1. [mail2markdown.gs Summary](#11-mail2markdowngs-summary)
   2. [attachment2drive.gs Summary](#12-attachment2drivegs-summary)
2. [mail2markdown.gs](#2-mail2markdowngs)
   1. [Usage](#21-usage)
   2. [How It Works](#22-how-it-works)
3. [attachment2drive.gs](#3-attachment2drivegs)
   1. [Usage](#31-usage)
   2. [How It Works](#32-how-it-works)
4. [Configuration](#4-configuration)
   1. [Gmail Label Configuration](#41-gmail-label-configuration)
5. [Automation](#5-automation)
   1. [Automating the Google Apps Script](#51-automating-the-google-apps-script)
   2. [Further Automation](#52-further-automation)
   3. [Choosing Between rclone Commands](#53-choosing-between-rclone-commands)
6. [AI Disclosure](#6-ai-disclosure)
7. [License](#7-license)

---

## 1. Summaries

### 1.1 mail2markdown.gs Summary

This is a Google Apps Script to export emails from Gmail with the selected label to a specified folder as both markdown and PDF files. This was originally created to get AI meeting summaries out of my email and into Obsidian as markdown files. The styling for the markdown export has been based on emails from Fathom.ai, so may need adjustments if using a different service or if the emails have a different layout. Processed emails are marked with a "Processed" label to prevent duplicate processing.

### 1.2 attachment2drive.gs Summary

This is a Google Apps Script to automatically save PDF attachments from Gmail emails with a specified label to a structured folder on Google Drive. It was created to handle recurring PDF attachments (like monthly invoices) by saving them with standardised names and organising them by year. The script marks processed emails with a "Processed" label to prevent duplicate processing, and allows for flexible folder structures and file naming conventions.

---

## 2. mail2markdown.gs

### 2.1 Usage

1. Open [Google Drive](https://drive.google.com) and create a folder named Meeting Summaries
2. Open [Google Apps Script](https://script.google.com/)
3. Paste the contents of the code.gs file in the script window
4. Update the configuration variables at the top of the script:
   - `labelName`: The Gmail label to search for (use full path for nested labels, e.g., "Parent/Child Label")
   - `processedLabelName`: The label to mark processed emails (default: "Processed")
   - `mainFolderName`: The Google Drive folder to save to
   - `mdSubFolderName`: Subfolder for markdown files (default: "md")
   - `pdfSubFolderName`: Subfolder for PDF files (default: "pdf")
5. Save and run the script

---

### 2.2 How It Works

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

## 3. attachment2drive.gs

### 3.1 Usage

1. Open [Google Drive](https://drive.google.com) and create a folder for your attachments
2. Open [Google Apps Script](https://script.google.com/)
3. Paste the contents of attachment2drive.gs in the script window
4. Update the configuration variables at the top of the script:
   - `labelName`: The Gmail label to search for (use full path for nested labels, e.g., "Parent/Child Label")
   - `processedLabelName`: The label to mark processed emails (default: "Processed")
   - `mainFolderName`: The Google Drive folder to save to
   - `subFolderName`: Optional subfolder (leave empty to save directly in main folder)
   - `fileNamePrefix`: Prefix for saved files (can be different from label)
5. Save and run the script

---

### 3.2 How It Works

- Scans Gmail for emails with the specified label
- Creates a year-based folder structure
- Saves PDF attachments with standardised names
- Marks processed emails with a "Processed" label
- Files are created with the following filename structure:
  - [FileNamePrefix]_[YYYY]-[MM]-[DD].pdf
- Folder Structure Example:

``` text
📂 Municipal Invoices/
   ├── 📂 PDF/           (Optional subfolder)
   │   ├── 📂 2025/
   │   │   ├── Municipal_Invoice_2025-03-18.pdf
   │   │   ├── Municipal_Invoice_2025-03-19.pdf
   │
   📂 2025/              (If no subfolder specified)
      ├── Municipal_Invoice_2025-04-01.pdf
```

---

## 4. Configuration

### 4.1 Gmail Label Configuration

- For nested labels, specify the full path using forward slashes (/)
- Examples:
  - `"Invoices/Municipal"` for a label nested under "Invoices"
  - `"Work/2024/Receipts"` for a deeply nested label
- The script will create the "Processed" label at the root level, not nested

---

## 5. Automation

### 5.1 Automating the Google Apps Script

1. Click Run (▶) in Google Apps Script to test
2. Click Triggers (⏰) → Add Trigger:
3. Function to run: saveAIMeetingSummaryEmails or saveEmailAttachments
4. Choose event source: Time-driven
5. Type: Minutes/Hours/Days
6. Save changes

---

### 5.2 Further Automation

- To automate copying files from Gdrive to a local folder, use rclone. This example copies only the markdown files to an existing Obsidian vault:
  - `rclone sync "gdrive:Meeting Summaries/md" "/path/to/your/obsidian/vault/Meeting Summaries"`

- This can be automated by setting up a cron to run at a user-specified interval and generate logs:
  - `*/10 * * * * /usr/local/bin/rclone sync "gdrive:Meeting Summaries/md" "/path/to/your/obsidian/vault/Meeting Summaries" --progress >> ~/rclone_sync.log 2>&1`

---

### 5.3 Choosing Between rclone Commands

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

## 6. AI Disclosure

This application was developed with assistance from artificial intelligence tools. While the initial concept, direction, and architectural decisions were human-driven, AI was utilised to help write and refine portions of the codebase. This collaboration between human and AI development approaches was chosen to enhance development efficiency while maintaining human oversight of the project's goals and quality standards.

## 7. License

This project is released under [The Unlicense](LICENSE), which allows anyone to freely use, modify, and distribute this software for any purpose. Note that this license applies only to the scripts themselves - all Gmail data, email content, and attachments processed by these scripts remain the intellectual property of their respective owners. This application makes no claim to ownership of any email content, attachments, or other data processed through Gmail or Google Drive.

---
