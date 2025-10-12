import multer from 'multer';
import sharp from 'sharp';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'SecondMarket/earbuds', // Cloudinary folder name
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `earbud-${uniqueSuffix}`;
    },
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Resize images
      { quality: 'auto' } // Auto quality optimization
    ]
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to upload buffer to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(buffer).toString('base64');
    const dataURI = `data:image/jpeg;base64,${b64}`;
    
    const uploadOptions = {
      folder: 'SecondMarket',
      ...options
    };
    
    cloudinary.uploader.upload(dataURI, uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// Function to delete file from Cloudinary
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

export const uploadToCloudinary = async (fileBuffer, baseName = 'image') => {
  const sizes = [
    { name: 'thumbnail', width: 150 },
    { name: 'medium', width: 600 },
    { name: 'large', width: 1200 },
  ];

  const uploadResults = {};

  for (const size of sizes) {
    const resizedBuffer = await sharp(fileBuffer)
      .resize(size.width)
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    const uniqueId = `${baseName}-${size.name}-${Date.now()}`;
    const uploaded = await cloudinary.uploader.upload_stream(
      {
        folder: 'SecondMarket/earbuds',
        format: 'webp',
        public_id: uniqueId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        return result;
      }
    );

    const uploadedPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'SecondMarket/earbuds',
          format: 'webp',
          public_id: uniqueId,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(resizedBuffer);
    });

    const result = await uploadedPromise;
    uploadResults[size.name] = result.secure_url;
  }

  return uploadResults;
};

export { cloudinary };
export default upload;
