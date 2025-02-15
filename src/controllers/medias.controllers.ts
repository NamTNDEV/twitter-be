import { Request, Response } from 'express';
import path from 'path';
import { MESSAGES } from '~/constants/messages';
import mediaService from '~/services/medias.services';
import { imagesPath, videosPath } from '~/utils/file';

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImages(req, res);
  res.json({
    message: MESSAGES.FILE_UPLOADED_SUCCESSFUL,
    data: result
  });
  return;
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideo(req, res);
  res.json({
    message: MESSAGES.FILE_UPLOADED_SUCCESSFUL,
    data: result
  });
  return;
}

export const serveImageController = (req: Request, res: Response) => {
  const { file_name } = req.params;
  return res.sendFile(path.resolve(imagesPath, file_name), (err) => {
    if (err) {
      res.status((err as any).status).json({
        message: MESSAGES.FILE_NOT_FOUND
      });
    }
  });
}

export const serveVideoController = (req: Request, res: Response) => {
  const { file_name } = req.params;
  return res.sendFile(path.resolve(videosPath, file_name), (err) => {
    if (err) {
      res.status((err as any).status).json({
        message: MESSAGES.FILE_NOT_FOUND
      });
    }
  });
}