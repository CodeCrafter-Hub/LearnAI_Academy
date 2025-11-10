/**
 * VideoStorageService - Handles video storage on Cloudflare R2
 * 
 * Manages video uploads, CDN delivery, and file management
 */

class VideoStorageService {
  constructor() {
    // Cloudflare R2 configuration (S3-compatible)
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    this.secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'learnai-video-lessons';
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL; // CDN URL

    // Initialize S3 client for R2 (lazy load to avoid import errors if not installed)
    this.s3Client = null;
  }

  /**
   * Initialize S3 client (lazy loading)
   */
  async getS3Client() {
    if (this.s3Client) {
      return this.s3Client;
    }

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
      return this.s3Client;
    } catch (error) {
      console.error('Error initializing S3 client:', error);
      throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
    }
  }

  /**
   * Upload video file to R2
   * @param {Buffer|Stream} file - Video file
   * @param {string} fileName - File name
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} Public URL
   */
  async uploadVideo(file, fileName, contentType = 'video/mp4') {
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('Cloudflare R2 credentials not configured');
    }

    try {
      const s3Client = await this.getS3Client();
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const key = `videos/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Make publicly accessible
        ACL: 'public-read',
      });

      await s3Client.send(command);

      // Return public URL
      return `${this.publicUrl}/${key}`;
    } catch (error) {
      console.error('Error uploading video to R2:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Upload video from URL (download and re-upload)
   * @param {string} sourceUrl - Source video URL
   * @param {string} fileName - Destination file name
   * @returns {Promise<string>} Public URL
   */
  async uploadVideoFromUrl(sourceUrl, fileName) {
    try {
      // Download video
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Upload to R2
      return await this.uploadVideo(buffer, fileName, response.headers.get('content-type') || 'video/mp4');
    } catch (error) {
      console.error('Error uploading video from URL:', error);
      throw error;
    }
  }

  /**
   * Delete video from R2
   * @param {string} fileName - File name
   * @returns {Promise<void>}
   */
  async deleteVideo(fileName) {
    try {
      const s3Client = await this.getS3Client();
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      
      const key = `videos/${fileName}`;
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting video from R2:', error);
      throw error;
    }
  }

  /**
   * Get video URL
   * @param {string} fileName - File name
   * @returns {string} Public URL
   */
  getVideoUrl(fileName) {
    if (!this.publicUrl) {
      return null;
    }
    return `${this.publicUrl}/videos/${fileName}`;
  }

  /**
   * Generate thumbnail URL (placeholder - implement thumbnail generation)
   * @param {string} videoFileName - Video file name
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(videoFileName) {
    if (!this.publicUrl) {
      return null;
    }
    // In production, generate thumbnails from video
    // For now, return placeholder
    return `${this.publicUrl}/thumbnails/${videoFileName.replace('.mp4', '.jpg')}`;
  }
}

export const videoStorageService = new VideoStorageService();
export default videoStorageService;

