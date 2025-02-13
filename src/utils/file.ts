import { Request, Response } from 'express';
import fs from "fs";
import path from "path";
import { MESSAGES } from '~/constants/messages';

export const UploadsFileDir = path.resolve('uploads');
export const ImagesDir = path.resolve(UploadsFileDir, 'images');
export const VideosDir = path.resolve(UploadsFileDir, 'videos');

// Single media upload
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const formidable = async () => {
  return (await import('formidable'));
}

export const initUploadsDir = () => {
  if (!fs.existsSync(UploadsFileDir)) {
    fs.mkdirSync(ImagesDir, { recursive: true });
    fs.mkdirSync(VideosDir, { recursive: true });
  }
}

export const handleUploadSingleImage = async (req: Request, res: Response) => {
  const form = (await formidable()).default({
    uploadDir: ImagesDir,
    maxFiles: 1,
    maxFileSize: MAX_IMAGE_SIZE,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const isImage = mimetype?.includes('image/');
      const uploadedKey = name === 'image';
      const isValid = isImage && uploadedKey;
      if (!isValid) {
        form.emit('error' as any, new Error(MESSAGES.FILE_UPLOAD_NOT_VALID) as any);
      }
      return Boolean(isValid);
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      if (Object.keys(files).length === 0) {
        return reject(new Error(MESSAGES.FILE_UPLOADED_IS_REQUIRED));
      }

      const file = files[Object.keys(files)[0]];
      resolve(file);
    })
  });
}