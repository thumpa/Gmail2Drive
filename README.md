# Gmail2Drive
This is a Google Apps Script to export emails from Gmail with the selected label to a specified folder as both markdown and PDF files. This was originally created to get AI meeting summaries out of my email and into Obsidian as markkdown files. The styling for the markdown export has been based on emails from Fathom.ai, so may need adjustments if using a different service or if the emails have a different layout. Processed emails are automatically starred so it will only generate files for new emails.

⸻

📌 Usage

1. Open Google Drive and create a folder named Meeting Summaries
2. Open Google Apps Script (https://script.google.com/)
3.	Paste the contents of the code.gs file in the script window
4.  Save the script
5.  Run the script

⸻

📌 How It Works

- Scans Gmail for emails with the relevant label
- Creates a weekly folder inside the specified folder for each format
- Saves each email as a Markdown file and PDF file inside the correct weekly folder
- Marks each processed email as Starred
- Files are created with the following filename structure:
  - [EmailSubject][Date][EmailTimeStamp].md
- Folder Structure Example:

```
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

⸻

📌 Automating the Google Apps Script

1.	Click Run (▶) in Google Apps Script to test
2.	Click Triggers (⏰) → Add Trigger:
3.	Function to run: saveAIMeetingSummaryEmails
4.	Choose event source: Time-driven
5.	Type: Minutes/Hours/Days
6.	Save changes

⸻

📌 Further Automation

- To automate copying files from Gdrive to a local folder, use rclone. This example copies only the markdown files to an existing Obsidian vault:
  - `rclone sync "gdrive:Meeting Summaries/md" "/Users/YOUR_USERNAME/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName/Meeting Summaries"`

- This can be automated by setting up a cron to run at a user-specified interval and generate logs:
  - `*/10 * * * * /usr/local/bin/rclone sync rclone sync "gdrive:Meeting Summaries/md" "/Users/YOUR_USERNAME/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName/Meeting Summaries" --progress >> ~/rsync_cron.log 2>&1`

⸻

