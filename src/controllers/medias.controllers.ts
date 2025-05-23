import { Request, Response } from 'express';
import path from 'path';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { MESSAGES } from '~/constants/messages';
import mediaService from '~/services/medias.services';
import { getFileSize, imagesPath, videosPath } from '~/utils/file';
import mime from 'mime';
import fs from 'fs';
import { sendFileFromS3 } from '~/utils/s3';

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

export const uploadVideoHlsController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideoHls(req, res);
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

export const serveM3U8Controller = (req: Request, res: Response) => {
  const { id } = req.params;
  // return res.sendFile(path.resolve(videosPath, id, 'master.m3u8'), (err) => {
  //   if (err) {
  //     res.status((err as any).status).json({
  //       message: MESSAGES.FILE_NOT_FOUND
  //     });
  //   }
  // });
  sendFileFromS3(res, `videos-hls/${id}/master.m3u8`);
}

export const serveSegmentController = (req: Request, res: Response) => {
  const { id, v, segment } = req.params;
  // return res.sendFile(path.resolve(videosPath, id, v, segment), (err) => {
  //   if (err) {
  //     res.status((err as any).status).json({
  //       message: MESSAGES.FILE_NOT_FOUND
  //     });
  //   }
  // });
  sendFileFromS3(res, `videos-hls/${id}/${v}/${segment}`);
}

export const serveStreamingVideoController = (req: Request, res: Response) => {
  const range = req.headers.range;
  if (!range) {
    res.status(HTTP_STATUS.RANGE_NOT_SATISFIABLE).json({
      message: MESSAGES.RANGE_NOT_PROVIDED
    });

    return;
  }

  const { file_name } = req.params;
  const videoPath = path.resolve(videosPath, file_name);

  const videoSize = getFileSize(videoPath);

  const CHUNK_SIZE = 10 ** 6;

  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || 'video/*';

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  };

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
}

export const videoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const status = await mediaService.getVideoStatus(id);
  res.json({
    message: MESSAGES.GET_VIDEO_STATUS_SUCCESSFUL,
    data: status
  });
  return;
}