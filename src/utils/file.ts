import { Request, Response } from 'express';
import { File } from 'formidable';
import fs from "fs";
import path from "path";
import { MESSAGES } from '~/constants/messages';

export const UploadsFileDir = path.resolve('uploads');
export const TempsFileDir = path.resolve(UploadsFileDir, 'temps');
export const ImagesDir = path.resolve(UploadsFileDir, 'images');
export const VideosDir = path.resolve(UploadsFileDir, 'videos');

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_FILE_SIZE = 4 * 10 * 1024 * 1024; // 20MB

const formidable = async () => {
  return (await import('formidable'));
}

export const initUploadsDir = () => {
  if (!fs.existsSync(UploadsFileDir)) {
    fs.mkdirSync(TempsFileDir, { recursive: true });
    fs.mkdirSync(ImagesDir, { recursive: true });
    fs.mkdirSync(VideosDir, { recursive: true });
  }
}

export const handleUploadFile = async (req: Request, res: Response) => {
  const form = (await formidable()).default({
    uploadDir: TempsFileDir,
    maxFiles: MAX_FILES,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_TOTAL_FILE_SIZE,
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

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      if (Object.keys(files).length === 0) {
        return reject(new Error(MESSAGES.FILE_UPLOADED_IS_REQUIRED));
      }
      // const file = (files[Object.keys(files)[0]] as File[])[0];
      const uploadedFile = files.image as File[];
      resolve(uploadedFile);
    })
  });
}

export const deleteFileAfterUpload = (filepath: string) => {
  fs.unlinkSync(filepath);
}

export const getNameWithoutExtension = (filename: string) => {
  const nameArr = filename.split('.');
  nameArr.pop();
  return nameArr.join('');
}