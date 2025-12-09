import { google } from 'googleapis';
import { Readable } from 'stream';

interface GoogleDriveConfig {
  clientEmail: string;
  privateKey: string;
  parentFolderId?: string;
}

export class GoogleDriveService {
  private drive;
  private parentFolderId?: string;

  constructor(config: GoogleDriveConfig) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.clientEmail,
        private_key: config.privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
    this.parentFolderId = config.parentFolderId;
  }

  /**
   * Create a new folder in Google Drive
   */
  async createFolder(folderName: string): Promise<{ id: string; webViewLink: string }> {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: this.parentFolderId ? [this.parentFolderId] : undefined,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
      });

      const folderId = response.data.id!;
      const webViewLink = response.data.webViewLink!;

      // Make folder publicly accessible
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return { id: folderId, webViewLink };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create Google Drive folder');
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    folderId: string
  ): Promise<{ id: string; webViewLink: string }> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType,
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink',
      });

      const fileId = response.data.id!;
      const webViewLink = response.data.webViewLink!;

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return { id: fileId, webViewLink };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  /**
   * Get folder link
   */
  async getFolderLink(folderId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'webViewLink',
      });

      return response.data.webViewLink || '';
    } catch (error) {
      console.error('Error getting folder link:', error);
      throw new Error('Failed to get folder link');
    }
  }
}

// Initialize Google Drive service with environment variables
export function initGoogleDrive(): GoogleDriveService {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured');
  }

  return new GoogleDriveService({
    clientEmail,
    privateKey,
    parentFolderId,
  });
}
