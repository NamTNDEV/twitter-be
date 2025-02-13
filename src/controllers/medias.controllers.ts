import e, { Request, Response } from 'express';
import { UploadsFileDir, ImagesDir, VideosDir } from '~/utils/file';

const formidable = async () => {
  return (await import('formidable'));
}

// Single media upload
const MAX_FILE = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadSingleMedia = async (req: Request, res: Response) => {
  const form = (await formidable()).default({
    uploadDir: ImagesDir,
    maxFiles: MAX_FILE,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
    }

    const file = files[Object.keys(files)[0]];
    res.json({
      message: 'File uploaded successfully',
      result: file
    });
  });

}