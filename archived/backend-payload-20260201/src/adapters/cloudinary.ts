import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import type { CollectionConfig } from 'payload'

export interface CloudinaryAdapterArgs {
  cloudName: string
  apiKey: string
  apiSecret: string
  folder?: string
}

/**
 * Cloudinary adapter for Payload CMS cloud-storage plugin
 * Compatible with Vercel serverless deployment
 */
export const cloudinaryAdapter = ({
  cloudName,
  apiKey,
  apiSecret,
  folder = '',
}: CloudinaryAdapterArgs): Adapter => {
  // Log initialization (helpful for debugging on Vercel)
  console.log('[Cloudinary] Initializing adapter...', {
    cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : 'MISSING',
    apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING',
    apiSecret: apiSecret ? 'SET' : 'MISSING',
    folder,
  })

  // IMPORTANT: Don't throw during build time - return a no-op adapter
  // Vercel doesn't have env vars during build, only at runtime
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary] Credentials missing - returning placeholder adapter (will work at runtime)')
    
    // Return a placeholder adapter that will fail gracefully
    return ({ collection, prefix }): GeneratedAdapter => {
      return {
        name: 'cloudinary-placeholder',
        generateURL: ({ filename }) => {
          console.warn('[Cloudinary] generateURL called but credentials missing')
          return `/api/media/file/${filename}`
        },
        handleUpload: async () => {
          throw new Error('Cloudinary credentials not configured. Please check your environment variables.')
        },
        handleDelete: async () => {
          console.warn('[Cloudinary] handleDelete called but credentials missing')
        },
        staticHandler: async (req, { params }) => {
          return new Response('Cloudinary not configured', { status: 500 })
        },
      }
    }
  }

  // Configure cloudinary once
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  console.log('[Cloudinary] Configuration successful')

  return ({ collection, prefix }): GeneratedAdapter => {
    console.log('[Cloudinary] Creating adapter for collection:', collection?.slug, 'prefix:', prefix)
    
    const getPublicId = (filename: string): string => {
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '')
      return [folder, prefix, filenameWithoutExt].filter(Boolean).join('/')
    }

    return {
      name: 'cloudinary',
      
      generateURL: ({ filename }) => {
        const publicId = getPublicId(filename)
        const url = cloudinary.url(publicId, {
          secure: true,
          resource_type: 'auto',
        })
        console.log('[Cloudinary] Generated URL:', url)
        return url
      },

      handleUpload: async ({ file, data }) => {
        console.log('[Cloudinary] handleUpload called:', {
          filename: file.filename,
          mimeType: file.mimeType,
          hasBuffer: !!file.buffer,
          bufferSize: file.buffer?.length,
        })

        const publicId = getPublicId(file.filename)

        return new Promise<void>((resolve, reject) => {
          if (!file.buffer) {
            console.error('[Cloudinary] No file buffer available')
            return reject(new Error('No file buffer available'))
          }

          console.log('[Cloudinary] Starting upload to publicId:', publicId)

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: 'auto',
              overwrite: true,
            },
            (error, result) => {
              if (error) {
                console.error('[Cloudinary] Upload failed:', error)
                return reject(error)
              }
              console.log('[Cloudinary] Upload successful:', result?.secure_url)
              resolve()
            },
          )

          uploadStream.end(file.buffer)
        })
      },

      handleDelete: async ({ filename, doc }) => {
        console.log('[Cloudinary] handleDelete called for:', filename)
        const publicId = getPublicId(filename)

        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
          console.log('[Cloudinary] Delete successful:', publicId)
        } catch (error) {
          console.warn('[Cloudinary] Delete failed (non-critical):', error)
          // Silent fail for delete operations - file might already be gone
        }
      },

      staticHandler: async (req, { params }) => {
        const filename = (params as { filename: string }).filename
        const publicId = getPublicId(filename)
        const url = cloudinary.url(publicId, { 
          secure: true,
          resource_type: 'auto',
        })
        console.log('[Cloudinary] staticHandler redirecting to:', url)
        return Response.redirect(url, 302)
      },
    }
  }
}
