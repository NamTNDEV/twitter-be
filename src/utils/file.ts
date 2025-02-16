import { Request, Response } from 'express';
import { File } from 'formidable';
import fs from "fs";
import path from "path";
import { MESSAGES } from '~/constants/messages';

export const uploadsPath = path.resolve('uploads');
export const imagesPath = path.resolve(uploadsPath, 'images');
export const videosPath = path.resolve(uploadsPath, 'videos');
export const imageTempPath = path.resolve(imagesPath, 'temps');
export const videoTempPath = path.resolve(videosPath, 'temps');

// Image Upload 
const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = MAX_FILES * MAX_FILE_SIZE;

// Video Upload
const MAX_VIDEO_FILES = 1;
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TOTAL_VIDEO_FILE_SIZE = MAX_VIDEO_FILES * MAX_VIDEO_FILE_SIZE;

const formidable = async () => {
  return (await import('formidable'));
}
const nanoid = async () => {
  return (await import('nanoid'));
}

export const initUploadsDir = () => {
  if (!fs.existsSync(uploadsPath)) {
    [imagesPath, videosPath, imageTempPath, videoTempPath].forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });
  }
}

export const handleUploadImages = async (req: Request, res: Response) => {
  const form = (await formidable()).default({
    uploadDir: imageTempPath,
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
      const uploadedImages = files.image as File[];
      resolve(uploadedImages);
    })
  });
}

export const handleUploadVideo = async (req: Request, res: Response) => {
  const idName = (await nanoid()).nanoid();
  const form = (await formidable()).default({
    uploadDir: videosPath,
    maxFiles: MAX_VIDEO_FILES,
    maxFileSize: MAX_VIDEO_FILE_SIZE,
    // keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const isVideo = mimetype?.includes('mp4') || mimetype?.includes('quicktime');
      const uploadedKey = name === 'video';
      const isValid = isVideo && uploadedKey;
      if (!isValid) {
        form.emit('error' as any, new Error(MESSAGES.FILE_UPLOAD_NOT_VALID) as any);
      }
      return Boolean(isValid);
    },
    filename: () => {
      return idName;
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

      const uploadedVideos = files.video as File[];
      uploadedVideos.forEach(video => {
        const extension = getExtension(video.originalFilename as string);
        fs.renameSync(video.filepath, `${video.filepath}.${extension}`);
        video.newFilename = `${video.newFilename}.${extension}`;
        video.filepath = `${video.filepath}.${extension}`;
      });
      resolve(uploadedVideos);
    })
  });
}

export const handleUploadVideoHls = async (req: Request, res: Response) => {
  const idName = (await nanoid()).nanoid();
  const folderPath = path.resolve(videosPath, idName);
  fs.mkdirSync(folderPath, { recursive: true });
  const form = (await formidable()).default({
    uploadDir: folderPath,
    maxFiles: MAX_VIDEO_FILES,
    maxFileSize: MAX_VIDEO_FILE_SIZE,
    // keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const isVideo = mimetype?.includes('mp4') || mimetype?.includes('quicktime');
      const uploadedKey = name === 'video';
      const isValid = isVideo && uploadedKey;
      if (!isValid) {
        form.emit('error' as any, new Error(MESSAGES.FILE_UPLOAD_NOT_VALID) as any);
      }
      return Boolean(isValid);
    },
    filename: () => {
      return idName;
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

      const uploadedVideos = files.video as File[];
      uploadedVideos.forEach(video => {
        const extension = getExtension(video.originalFilename as string);
        fs.renameSync(video.filepath, `${video.filepath}.${extension}`);
        video.newFilename = `${video.newFilename}.${extension}`;
        video.filepath = `${video.filepath}.${extension}`;
      });
      resolve(uploadedVideos);
    })
  });
}

export const deleteFileAfterUpload = (filePath: string) => {
  fs.unlinkSync(filePath);
}

export const getNameWithoutExtension = (filename: string) => {
  const nameArr = filename.split('.');
  nameArr.pop();
  return nameArr.join('');
}

export const getExtension = (filename: string) => {
  const nameArr = filename.split('.');
  return nameArr[nameArr.length - 1];
}

export const getFileSize = (filePath: string) => {
  return fs.statSync(filePath).size;
}