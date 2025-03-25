function saveEmailAttachments() {
  // Configuration
  var labelName = "Municipal Invoices"; // Replace with your Gmail label
  var processedLabelName = "Processed"; // Label to mark processed emails
  var mainFolderName = "Municipal Invoices"; // Root folder on Google Drive
  var subFolderName = "PDF"; // Optional subfolder (leave empty to save directly in main folder)
  var fileNamePrefix = "Municipal Invoice"; // Prefix for saved files (can be different from label)
  
  // Get or create the main folder
  var mainFolder = getOrCreateFolder(mainFolderName);
  
  // Get or create the Processed label
  var processedLabel = GmailApp.getUserLabelByName(processedLabelName);
  if (!processedLabel) {
    processedLabel = GmailApp.createLabel(processedLabelName);
  }
  
  // Get the specified Gmail label
  var label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    console.log(`Label not found: ${labelName}`);
    return;
  }
  
  // Get all threads with the specified label
  var threads = label.getThreads();
  
  threads.forEach(thread => {
    var messages = thread.getMessages();
    
    messages.forEach(message => {
      // Check if message has already been processed
      if (message.getLabels().contains(processedLabel)) {
        console.log(`Skipping already processed email: ${message.getSubject()}`);
        return;
      }
      
      var emailDate = message.getDate();
      var year = emailDate.getFullYear();
      
      // Determine the target folder based on subfolder configuration
      var targetFolder;
      if (subFolderName && subFolderName.trim() !== "") {
        // Create year folder inside subfolder
        var subFolder = getOrCreateSubFolder(mainFolder, subFolderName);
        targetFolder = getOrCreateSubFolder(subFolder, year);
      } else {
        // Create year folder directly in main folder
        targetFolder = getOrCreateSubFolder(mainFolder, year);
      }
      
      // Get all attachments
      var attachments = message.getAttachments();
      
      attachments.forEach(attachment => {
        // Only process PDF attachments
        if (attachment.getContentType() === "application/pdf") {
          // Create new filename using prefix and date
          var formattedDate = Utilities.formatDate(emailDate, "GMT", "yyyy-MM-dd");
          var sanitizedPrefix = fileNamePrefix.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
          var newFileName = `${sanitizedPrefix}_${formattedDate}.pdf`;
          
          // Check if file already exists
          if (!fileExistsInDrive(targetFolder, newFileName)) {
            // Save the attachment
            var file = targetFolder.createFile(attachment);
            file.setName(newFileName);
            console.log(`✅ Saved attachment: ${newFileName} in ${year}`);
          } else {
            console.log(`📂 File already exists: ${newFileName}`);
          }
        }
      });
      
      // Mark the email as processed by adding the Processed label
      message.addLabel(processedLabel);
    });
  });
}

// === Helper Functions ===

// Function to check if a file exists in a folder
function fileExistsInDrive(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  return files.hasNext();
}

// Function to get or create a folder
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

// Function to get or create a subfolder
function getOrCreateSubFolder(parentFolder, subFolderName) {
  var subFolders = parentFolder.getFoldersByName(subFolderName);
  return subFolders.hasNext() ? subFolders.next() : parentFolder.createFolder(subFolderName);
} 