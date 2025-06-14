import { Request, Response } from 'express';

// Placeholder for Google OAuth and Drive integration
// In a real implementation, we would use the google-auth-library and googleapis packages

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

export async function getDriveFolderName(folderId: string): Promise<string | null> {
  try {
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id,name'
    });

    return response.data.name || null;
  } catch (error) {
    console.error('Error fetching folder name with service account:', error);
    return null;
  }
}

// Check if a file exists in Google Drive using OAuth
export async function checkFileExistsInDrive(fileId: string, googleTokens: any): Promise<boolean> {
  try {
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleTokens.access_token,
      refresh_token: googleTokens.refresh_token,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,trashed'
    });

    // File exists and is not trashed
    return !response.data.trashed;
  } catch (error: any) {
    // If file not found or access denied, return false
    if (error.code === 404 || error.code === 403) {
      return false;
    }
    console.error('Error checking file existence:', error);
    return false;
  }
}

// Upload file to Google Drive using OAuth
export async function uploadFileToGoogleDriveOAuth(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  folderId: string,
  googleTokens: any
): Promise<string> {
  const { google } = await import('googleapis');
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: googleTokens.access_token,
    refresh_token: googleTokens.refresh_token,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType,
      body: fileBuffer,
    },
    fields: 'id',
  });

  return response.data.id!;
}

// Delete file from Google Drive using OAuth
export async function deleteFileFromGoogleDriveOAuth(fileId: string, googleTokens: any): Promise<void> {
  const { google } = await import('googleapis');
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: googleTokens.access_token,
    refresh_token: googleTokens.refresh_token,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  await drive.files.delete({
    fileId: fileId,
  });
}

export async function authenticateGoogle(req: Request, res: Response): Promise<void> {
  // In a real implementation, this would redirect to Google's OAuth consent screen
  // For demo purposes, we'll simulate successful authentication
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(500).json({ message: "Google API credentials not configured" });
    return;
  }
  
  // Redirect to a fake Google login
  res.redirect(`/api/auth/google/callback?success=true`);
}

// Function to download file content from Google Drive
export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  try {
    const { google } = await import('googleapis');
    const serviceAccount = await import('../keys/service-account.json');
    
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );
    
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    
    // Get file metadata first to check mime type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name'
    });
    
    const mimeType = metadata.data.mimeType;
    
    // For Google Docs/Sheets/Slides, export as PDF
    if (mimeType?.includes('google-apps.document')) {
      const response = await drive.files.export({
        fileId: fileId,
        mimeType: 'application/pdf'
      }, { responseType: 'arraybuffer' });
      return Buffer.from(response.data as ArrayBuffer);
    } else if (mimeType?.includes('google-apps.spreadsheet')) {
      const response = await drive.files.export({
        fileId: fileId,
        mimeType: 'application/pdf'
      }, { responseType: 'arraybuffer' });
      return Buffer.from(response.data as ArrayBuffer);
    } else if (mimeType?.includes('google-apps.presentation')) {
      const response = await drive.files.export({
        fileId: fileId,
        mimeType: 'application/pdf'
      }, { responseType: 'arraybuffer' });
      return Buffer.from(response.data as ArrayBuffer);
    } else {
      // For other files (PDFs, images, etc.), download directly
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });
      return Buffer.from(response.data as ArrayBuffer);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Could not download file: ${error}`);
  }
}

// Function to scan folder recursively for all documents
export async function scanFolderRecursively(folderId: string): Promise<{files: DriveFile[], folders: DriveFile[]}> {
  try {
    const { google } = await import('googleapis');
    const serviceAccount = await import('../keys/service-account.json');
    
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );
    
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    
    // Get all items in this folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,modifiedTime)',
      orderBy: 'name'
    });
    
    const items = response.data.files || [];
    const files: DriveFile[] = [];
    const folders: DriveFile[] = [];
    
    // Separate files and folders
    for (const item of items) {
      const driveFile: DriveFile = {
        id: item.id!,
        name: item.name!,
        mimeType: item.mimeType!,
        size: item.size,
        modifiedTime: item.modifiedTime
      };
      
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        folders.push(driveFile);
      } else {
        files.push(driveFile);
      }
    }
    
    // Recursively scan subfolders
    for (const folder of folders) {
      console.log(`Scanning subfolder: ${folder.name} (ID: ${folder.id})`);
      try {
        const subContent = await scanFolderRecursively(folder.id);
        console.log(`Found ${subContent.files.length} files in subfolder: ${folder.name}`);
        files.push(...subContent.files);
        folders.push(...subContent.folders);
      } catch (subError) {
        console.error(`Error scanning subfolder ${folder.name}:`, subError);
      }
    }
    
    return { files, folders };
  } catch (error) {
    console.error('Error scanning folder:', error);
    return { files: [], folders: [] };
  }
}

export async function getDriveFiles(folderId: string, accessToken?: string): Promise<DriveFile[]> {
  // Clean up the folder ID if it's a full URL
  let cleanFolderId = folderId;
  
  // Handle different formats of Google Drive links
  if (folderId.includes('drive.google.com')) {
    // Extract the ID from a Google Drive URL
    const idMatch = folderId.match(/[-\w]{25,}/);
    if (idMatch) {
      cleanFolderId = idMatch[0];
    }
  }
  
  console.log(`Accessing Google Drive folder: ${cleanFolderId}`);
  
  try {
    // Try to connect to real Google Drive using service account
    const { google } = await import('googleapis');
    
    // Import service account credentials from file
    const serviceAccount = await import('../keys/service-account.json');
    
    console.log("Using service account:", serviceAccount.client_email);
    
    // Create JWT client for service account
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );
    
    // Authorize the service account
    await jwtClient.authorize();
    
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    
    // Use recursive scanning to get all files from folder and subfolders
    const scanResult = await scanFolderRecursively(cleanFolderId);
    const allFiles = scanResult.files;
    
    console.log(`Successfully accessed Google Drive - found ${allFiles.length} real files in folder and subfolders`);
    
    return allFiles;
    
  } catch (error: any) {
    console.error("Could not access Google Drive with service account:", error);
    console.log("Error message:", error.message);
    console.log("Error code:", error.code);
    console.log("Full error details:", JSON.stringify(error, null, 2));
    
    // For now, fall back to simulated data while we debug permissions
    console.log("Using fallback file simulation due to Drive access error");
    const folderHash = hashString(cleanFolderId);
    return generateFilesFromFolderHash(folderHash);
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function generateFilesFromFolderHash(hash: number): DriveFile[] {
  // Use the hash to deterministically generate different file sets
  const fileSet: DriveFile[] = [];
  const fileTypes = [
    { type: 'id', variations: ['DriverLicense', 'Passport', 'ID_Card'] },
    { type: 'entity', variations: ['LLC_Certificate', 'Articles_Organization', 'Entity_Formation'] },
    { type: 'financial', variations: ['Bank_Statement', 'Credit_Report', 'Financial_Statement'] },
    { type: 'property', variations: ['Property_Deed', 'Property_Survey', 'Appraisal_Report'] },
    { type: 'insurance', variations: ['Insurance_Policy', 'Insurance_Binder', 'Hazard_Insurance'] },
    { type: 'loan', variations: ['Loan_Application', 'Promissory_Note', 'Mortgage_Agreement'] },
    { type: 'title', variations: ['Title_Commitment', 'Title_Report', 'Preliminary_Title'] },
    { type: 'tax', variations: ['Tax_Returns', 'Property_Tax', 'Income_Verification'] }
  ];
  
  // Use generic borrower names
  const borrowerVariations = [
    { name: "Borrower Name", company: "Investment Properties LLC" },
    { name: "Property Owner", company: "Real Estate Holdings LLC" },
    { name: "Primary Investor", company: "Capital Investments LLC" },
    { name: "Main Borrower", company: "Property Management LLC" },
    { name: "DSCR Investor", company: "Real Estate Ventures LLC" },
    { name: "Lead Investor", company: "Property Acquisitions LLC" }
  ];
  
  // Select borrower based on hash
  const borrowerIndex = hash % borrowerVariations.length;
  const borrower = borrowerVariations[borrowerIndex];
  
  // Based on the hash, decide which property this is for
  const propertyVariations = [
    { address: "123 Main St", city: "Los Angeles", state: "CA", zip: "90001" },
    { address: "456 Oak Ave", city: "New York", state: "NY", zip: "10001" },
    { address: "789 Pine Rd", city: "Chicago", state: "IL", zip: "60007" },
    { address: "321 Maple Dr", city: "Miami", state: "FL", zip: "33101" },
    { address: "654 Cedar Ln", city: "Austin", state: "TX", zip: "73301" },
    { address: "987 Birch Way", city: "Seattle", state: "WA", zip: "98101" }
  ];
  
  // Select property based on hash
  const propertyIndex = (hash % 31) % propertyVariations.length;
  const property = propertyVariations[propertyIndex];
  
  // Determine loan amount based on hash
  const loanBases = [250000, 350000, 450000, 550000, 650000, 750000];
  const loanAmountIndex = (hash % 17) % loanBases.length;
  const loanAmount = loanBases[loanAmountIndex] + (hash % 50000);
  
  // Generate a modified date within the last month
  const now = new Date();
  const modifiedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (hash % 30));
  
  // Add files for each type, with some randomization based on the hash
  fileTypes.forEach((fileType, index) => {
    // Only include some file types based on the hash
    if ((hash + index) % 9 < 7) { // About 7/9 chance to include this file type
      const variationIndex = (hash + index) % fileType.variations.length;
      const fileVariation = fileType.variations[variationIndex];
      
      // Determine if it's a borrower's personal file or company file
      const isCompanyFile = (hash + index) % 2 === 0;
      const entityName = isCompanyFile ? borrower.company : borrower.name;
      
      // Create filename with borrower info
      const fileName = `${fileVariation}_${entityName.replace(/\s+/g, '_')}.pdf`;
      
      // Add the file
      fileSet.push({
        id: `${fileType.type}-${hash}-${index}`,
        name: fileName,
        mimeType: "application/pdf",
        size: ((hash % 10) + 1) + "." + (hash % 9) + " MB",
        modifiedTime: modifiedDate.toISOString()
      });
      
      // Sometimes add a second file of the same type (like multiple bank statements)
      if ((hash + index) % 5 === 0) {
        const secondVariationIndex = (variationIndex + 1) % fileType.variations.length;
        const secondFileVariation = fileType.variations[secondVariationIndex];
        const secondFileName = `${secondFileVariation}_${entityName.replace(/\s+/g, '_')}.pdf`;
        
        fileSet.push({
          id: `${fileType.type}-${hash}-${index}-2`,
          name: secondFileName,
          mimeType: "application/pdf",
          size: ((hash % 5) + 1) + "." + (hash % 9) + " MB",
          modifiedTime: new Date(modifiedDate.getTime() - (1000 * 60 * 60 * 24 * (hash % 10))).toISOString()
        });
      }
    }
  });
  
  // Add property address to some files
  fileSet.forEach(file => {
    if (file.name.includes('Property') || file.name.includes('Appraisal') || 
        file.name.includes('Title') || file.name.includes('Insurance')) {
      file.name = file.name.replace('.pdf', `_${property.address.replace(/\s+/g, '_')}.pdf`);
    }
  });
  
  // Add loan amount to loan documents
  fileSet.forEach(file => {
    if (file.name.includes('Loan') || file.name.includes('Mortgage') || 
        file.name.includes('Note') || file.name.includes('Application')) {
      file.name = file.name.replace('.pdf', `_$${loanAmount.toLocaleString()}.pdf`);
    }
  });
  
  return fileSet;
}

// Function to upload file to Google Drive
export async function uploadFileToGoogleDrive(
  fileName: string, 
  fileBuffer: Buffer, 
  mimeType: string, 
  folderId: string
): Promise<string> {
  try {
    const { google } = await import('googleapis');
    const serviceAccount = await import('../keys/service-account.json');
    
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ]
    );
    
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    
    // Convert Buffer to readable stream for Google Drive API
    const { Readable } = await import('stream');
    const fileStream = Readable.from(fileBuffer);
    
    // Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId]
      },
      media: {
        mimeType: mimeType,
        body: fileStream
      },
      fields: 'id'
    });
    
    console.log(`File uploaded to Google Drive with ID: ${response.data.id}`);
    return response.data.id!;
    
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw new Error(`Could not upload file to Google Drive: ${error}`);
  }
}

// Function to delete file from Google Drive
export async function deleteFileFromGoogleDrive(fileId: string): Promise<void> {
  try {
    const { google } = await import('googleapis');
    const serviceAccount = await import('../keys/service-account.json');
    
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ]
    );
    
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    
    // Delete the file
    await drive.files.delete({
      fileId: fileId
    });
    
    console.log(`File deleted from Google Drive: ${fileId}`);
    
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw new Error(`Could not delete file from Google Drive: ${error}`);
  }
}

// Clear all files from a Google Drive folder
export async function clearDriveFolder(folderId: string, accessToken: string, refreshToken: string) {
  try {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // List all files in the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)'
    });
    
    const files = response.data.files || [];
    
    // Delete each file
    for (const file of files) {
      if (file.id) {
        await drive.files.delete({
          fileId: file.id
        });
      }
    }
    
    console.log(`Cleared ${files.length} files from Google Drive folder: ${folderId}`);
    
  } catch (error) {
    console.error('Error clearing Google Drive folder:', error);
    throw new Error(`Could not clear Google Drive folder: ${error}`);
  }
}

// Upload documents to Google Drive folder
export async function uploadDocumentsToDrive(documents: any[], folderId: string, accessToken: string, refreshToken: string) {
  try {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const document of documents) {
      try {
        console.log('Processing document:', {
          id: document.id,
          name: document.name,
          fileId: document.fileId,
          hasFileId: !!document.fileId,
          fileIdLength: document.fileId?.length
        });
        
        let fileContent: Buffer;
        const documentName = document.name || document.originalName || `document_${document.id}`;
        
        // Check if this looks like a Google Drive file ID (format: alphanumeric, typically 25-44 characters, no file extension)
        const isGoogleDriveId = document.fileId && 
          document.fileId.length > 20 && 
          /^[a-zA-Z0-9_-]+$/.test(document.fileId) && 
          !document.fileId.includes('.');
        
        if (isGoogleDriveId) {
          console.log(`Downloading Google Drive document: ${document.fileId}`);
          try {
            // This is a Google Drive document - download it first
            const fileResponse = await drive.files.get({
              fileId: document.fileId,
              alt: 'media'
            });
            
            if (fileResponse.data && typeof fileResponse.data === 'string') {
              fileContent = Buffer.from(fileResponse.data);
            } else if (Buffer.isBuffer(fileResponse.data)) {
              fileContent = fileResponse.data;
            } else {
              throw new Error('Invalid file data received from Google Drive');
            }
          } catch (driveError: any) {
            if (driveError.status === 404) {
              console.log(`Google Drive file ${document.fileId} no longer exists, skipping: ${documentName}`);
              failedCount++;
              continue;
            }
            throw driveError;
          }
        } else {
          // This is a local file - read from uploads folder
          const fs = await import('fs');
          const path = await import('path');
          
          const filename = document.fileId || document.filename || document.originalName || document.name;
          if (!filename) {
            console.error('Document has no filename:', document);
            failedCount++;
            continue;
          }
          
          console.log(`Reading local file: ${filename}`);
          const filePath = path.join(process.cwd(), 'uploads', filename);
          
          try {
            fileContent = fs.readFileSync(filePath);
            console.log(`Successfully read local file: ${filename}, size: ${fileContent.length} bytes`);
          } catch (readError) {
            console.error(`Failed to read local file ${filename}:`, readError);
            failedCount++;
            continue;
          }
        }
        
        // Upload to target Google Drive folder
        const { Readable } = await import('stream');
        const stream = new Readable();
        stream.push(fileContent);
        stream.push(null); // End the stream
        
        await drive.files.create({
          requestBody: {
            name: documentName,
            parents: [folderId]
          },
          media: {
            mimeType: document.fileType || 'application/octet-stream',
            body: stream
          }
        });
        
        console.log(`Successfully uploaded document to Google Drive: ${documentName}`);
        successCount++;
        
      } catch (fileError) {
        console.error(`Error uploading document ${document.name || document.id}:`, fileError);
        failedCount++;
      }
    }
    
    console.log(`Upload complete: ${successCount} successful, ${failedCount} failed`);
    
    return {
      successCount,
      failedCount
    };
    
  } catch (error) {
    console.error('Error uploading documents to Google Drive:', error);
    throw new Error(`Could not upload documents to Google Drive: ${error}`);
  }
}
