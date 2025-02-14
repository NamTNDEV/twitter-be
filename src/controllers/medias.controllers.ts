import { Request, Response } from 'express';
import path from 'path';
import { MESSAGES } from '~/constants/messages';
import mediaService from '~/services/medias.services';
import { ImagesDir } from '~/utils/file';

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImage(req, res);
  res.json({
    message: MESSAGES.FILE_UPLOADED_SUCCESSFUL,
    data: result
  });
  return;
}

export const serveImageController = (req: Request, res: Response) => {
  const { file_name } = req.params;
  return res.sendFile(path.resolve(ImagesDir, file_name), (err) => {
    if (err) {
      res.status((err as any).status).json({
        message: MESSAGES.FILE_NOT_FOUND
      });
    }
  });
}