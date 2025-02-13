import { Request, Response } from 'express';
import { MESSAGES } from '~/constants/messages';
import mediaService from '~/services/medias.services';

export const uploadSingleImage = async (req: Request, res: Response) => {
  const result = await mediaService.uploadSingleImage(req, res);
  res.json({
    message: MESSAGES.FILE_UPLOADED_SUCCESSFUL,
    data: result
  });
  return;
}