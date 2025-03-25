function saveAIMeetingSummaryEmails() {
  var mainFolderName = "Meeting Summaries"; // Root folder on Google Drive
  var mdSubFolderName = "md"; // Markdown subfolder
  var pdfSubFolderName = "pdf"; // PDF subfolder

  // Get or create the main and subfolders
  var mainFolder = getOrCreateFolder(mainFolderName);
  var mdFolder = getOrCreateSubFolder(mainFolder, mdSubFolderName);
  var pdfFolder = getOrCreateSubFolder(mainFolder, pdfSubFolderName);

  var label = GmailApp.getUserLabelByName("AI Meeting Notes"); // Set relevant gmail label
  if (!label) {
    console.log("Label not found: AI Meeting Notes");
    return;
  }

  var threads = label.getThreads();

  threads.forEach(thread => {
    var messages = thread.getMessages();

    messages.forEach(message => {
      if (message.isStarred()) {
        console.log(`Skipping already processed email: ${message.getSubject()}`);
        return;
      }

      var subject = message.getSubject();
      var bodyHtml = message.getBody(); // ✅ Full unmodified email (for PDF)
      var emailDate = message.getDate();

      var year = emailDate.getFullYear();
      var weekNum = Utilities.formatDate(emailDate, "GMT", "w");
      var formattedWeekNum = ("0" + weekNum).slice(-2);
      var weeklyFolderName = `${year}-Week-${formattedWeekNum}`;

      var formattedDate = Utilities.formatDate(emailDate, "GMT", "yyyy-MM-dd");
      var formattedTime = Utilities.formatDate(emailDate, "GMT", "HHmm");

      var sanitizedSubject = subject.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      var mdFileName = `${sanitizedSubject}_${formattedDate}_${formattedTime}.md`;
      var pdfFileName = `${sanitizedSubject}_${formattedDate}_${formattedTime}.pdf`;

      // 📂 Save Markdown in `/Meeting Summaries/md/2025/2025-Week-11/`
      var yearFolderMD = getOrCreateSubFolder(mdFolder, year);
      var weeklyFolderMD = getOrCreateSubFolder(yearFolderMD, weeklyFolderName);

      // 📂 Save PDF in `/Meeting Summaries/pdf/2025/2025-Week-11/`
      var yearFolderPDF = getOrCreateSubFolder(pdfFolder, year);
      var weeklyFolderPDF = getOrCreateSubFolder(yearFolderPDF, weeklyFolderName);

      // ✅ Extract relevant content for Markdown
      var extractedHtml = extractRelevantHtml(bodyHtml);
      Logger.log("🔹 Extracted HTML Before Markdown Conversion:\n" + extractedHtml.substring(0, 500));

      // ✅ Convert extracted HTML to Markdown (Unmodified)
      var markdownBody = convertHtmlToMarkdown(extractedHtml);
      Logger.log("🔹 Markdown Output:\n" + markdownBody.substring(0, 500));

      var markdownContent = `# ${subject}\n\n${markdownBody}`;

      // ✅ Save Markdown file
      if (!fileExistsInDrive(weeklyFolderMD, mdFileName)) {
        weeklyFolderMD.createFile(mdFileName, markdownContent, MimeType.PLAIN_TEXT);
        console.log(`✅ Saved Markdown: ${mdFileName} in ${year}/${weeklyFolderName}`);
      } else {
        console.log(`📂 Markdown file already exists: ${mdFileName}`);
      }

      // ✅ Save PDF file (using the FULL unmodified email)
      if (!fileExistsInDrive(weeklyFolderPDF, pdfFileName)) {

        // Wrap raw HTML in a proper document structure
        var fullHtml = "<html><head><meta charset='UTF-8'></head><body>" + bodyHtml + "</body></html>";

        // Convert the HTML to a PDF Blob
        var pdfBlob = HtmlService.createHtmlOutput(fullHtml).getAs(MimeType.PDF).setName(pdfFileName);

        // Save the PDF file
        weeklyFolderPDF.createFile(pdfBlob);
        
        console.log(`✅ Saved PDF: ${pdfFileName} in ${year}/${weeklyFolderName}`);
      } else {
        console.log(`📂 PDF file already exists: ${pdfFileName}`);
      }

      // ✅ Mark the email as processed only after both formats are saved
      message.star();
    });
  });
}

// === Extracts only relevant HTML from email ===
function extractRelevantHtml(html) {
  try {
    if (!html || html.trim() === "") {
      throw new Error("❌ ERROR: HTML content is undefined or empty.");
    }

    Logger.log("✅ Extracting relevant content...");

    // Decode Quoted-Printable content
    html = html.replace(/=3D/g, "=").replace(/=\r\n/g, "");

    html = html.replace(/<style[\s\S]*?<\/style>/gi, "")
               .replace(/<head[\s\S]*?<\/head>/gi, "")
               .replace(/<meta[^>]+>/gi, "")
               .replace(/<!--[\s\S]*?-->/g, "");

    var bodyMatch = html.match(/<div[^>]*class=["']ai_notes_html_content["'][^>]*>([\s\S]*?)<\/div>/i);
    var extractedHtml = bodyMatch ? bodyMatch[1] : html;

    Logger.log("✅ Extracted HTML (First 500 chars):\n" + extractedHtml.substring(0, 500));
    return extractedHtml;
  } catch (error) {
    Logger.log("❌ Error in extractRelevantHtml(): " + error.message);
    return html;
  }
}

// === Converts Cleaned HTML to Markdown ===
function convertHtmlToMarkdown(html) {
  try {
    if (!html || html.trim() === "") {
      throw new Error("❌ ERROR: HTML content is undefined or empty.");
    }

    Logger.log("🔹 STEP 1: Raw HTML Input (First 500 chars):\n" + html.substring(0, 500));

    // ✅ Step 1: Remove inline styles
    html = html.replace(/<(\w+)[^>]*>/gi, "<$1>");
    Logger.log("🔹 STEP 2: Cleaned HTML (No Inline Styles):\n" + html.substring(0, 500));

    // ✅ Convert Links FIRST (before other transformations)
    html = html.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)");

    html = html.replace(/<a>(.*?)<\/a>/gi, "$1");
    html = html.replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi, "");

    // ✅ Process Headings First
    html = html
      .replace(/<h1>(.*?)<\/h1>/gi, "\n\n# $1\n\n")  
      .replace(/<h2>(.*?)<\/h2>/gi, "\n\n## $1\n\n") 
      .replace(/<h3>(.*?)<\/h3>/gi, "\n\n### $1\n\n"); 

    Logger.log("🔹 DEBUG: After Heading Replacement (First 500 chars):\n" + html.substring(0, 500));

    var markdown = html
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**") 
      .replace(/<b>(.*?)<\/b>/gi, "**$1**") 
      .replace(/<em>(.*?)<\/em>/gi, "*$1*") 
      .replace(/<i>(.*?)<\/i>/gi, "*$1*") 
      .replace(/<p>(.*?)<\/p>/gi, "\n$1\n") 
      .replace(/<br\s*\/?>/gi, "\n") 
      .replace(/<li>\s*<p>(.*?)<\/p>\s*<\/li>/gi, "\n- $1") 
      .replace(/<li>(.*?)<\/li>/gi, "\n- $1") 
      .replace(/<\/li>\s*<li>/gi, "\n- ") 
      .replace(/<ul>\s*<li>/gi, "\n\n- ") 
      .replace(/<ol>\s*<li>(.*?)<\/li>/gi, "\n1. $1") 
      .replace(/(## .*?)\n(- )/g, "$1\n\n$2") 
      .replace(/(### .*?)\n(- )/g, "$1\n\n$2") 
      .replace(/<\/?(?!strong|em|i)[^>]+>/g, "") 
      .replace(/\n\s*-\s*\n/g, "\n- ") 
      .replace(/\n\s*1\.\s*\n/g, "\n1. ") 
      .replace(/\n\s*\d+\.\s+/g, function(match) { return match.trim() + " "; }) 
      .replace(/\n{2,}/g, "\n") 
      .trim();

    Logger.log("🔹 DEBUG: Final Markdown Output (First 500 chars):\n" + markdown.substring(0, 500));
    return markdown;
  } catch (error) {
    Logger.log("❌ ERROR in convertHtmlToMarkdown(): " + error.message);
    return "ERROR: " + error.message;
  }
}

// === Function to Check for Existing Files in Google Drive ===
function fileExistsInDrive(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  return files.hasNext();
}

// === Function to Get or Create a Folder ===
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  var subFolders = parentFolder.getFoldersByName(subFolderName);
  return subFolders.hasNext() ? subFolders.next() : parentFolder.createFolder(subFolderName);
}
