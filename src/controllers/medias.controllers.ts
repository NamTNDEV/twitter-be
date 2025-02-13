import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { MESSAGES } from '~/constants/messages';
import { handleUploadSingleImage } from '~/utils/file';

export const uploadSingleImage = async (req: Request, res: Response) => {
  const file = await handleUploadSingleImage(req, res);
  res.json({
    message: MESSAGES.FILE_UPLOADED_SUCCESSFUL,
    file: file,
  });
}