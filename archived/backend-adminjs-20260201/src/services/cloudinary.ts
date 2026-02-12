import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  transformation?: any[];
}

export class CloudinaryService {
  /**
   * Upload an image from a file path or buffer
   */
  static async uploadImage(
    file: string | Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; publicId: string }> {
    const folder = options.folder || 'cannesh/products';

    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        folder,
        transformation: options.transformation || [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(
    files: (string | Buffer)[],
    options: UploadOptions = {}
  ): Promise<Array<{ url: string; publicId: string }>> {
    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, options))
    );
    return results;
  }

  /**
   * Delete an image by public ID
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Generate optimized URL for an image
   */
  static getOptimizedUrl(
    publicId: string,
    options: { width?: number; height?: number; crop?: string } = {}
  ): string {
    const transformation: any[] = [
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ];

    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
      });
    }

    return cloudinary.url(publicId, {
      transformation,
      secure: true,
    });
  }

  /**
   * Get thumbnail URL
   */
  static getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
    });
  }
}

export default cloudinary;
