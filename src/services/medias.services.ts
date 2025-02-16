import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import { MediaType } from "~/constants/enums";
import { Media } from "~/models/Other";
import { checkEnv } from "~/utils/env.ultis";
import { deleteFileAfterUpload, getNameWithoutExtension, handleUploadImages, handleUploadVideo, handleUploadVideoHls, imagesPath, } from "~/utils/file";
import { Queue } from "~/utils/queue";
import { encodeHLSWithMultipleVideoStreams } from "~/utils/video";

const queue = Queue.getInstance();
class MediaService {
  public async uploadImages(req: Request, res: Response) {
    const files = await handleUploadImages(req, res);
    const result: Media[] = await Promise.all(
      files.map(async file => {
        const newNameFile = getNameWithoutExtension(file.newFilename);
        const decoratedFilename = `${newNameFile}.jpg`;
        const uploadPath = path.resolve(imagesPath, decoratedFilename);
        await sharp(file.filepath).jpeg().toFile(uploadPath);
        deleteFileAfterUpload(file.filepath);
        return {
          url: checkEnv("dev") ? `http://localhost:${process.env.PORT}/static/image/${decoratedFilename}` : `${process.env.HOST}/static/image/${decoratedFilename}`,
          type: MediaType.Image
        }
      })
    );

    return result;
  }

  public async uploadVideo(req: Request, res: Response) {
    const uploadedVideos = await handleUploadVideo(req, res);
    const result: Media[] = uploadedVideos.map(file => {
      return {
        url: checkEnv("dev") ? `http://localhost:${process.env.PORT}/static/video/${file.newFilename}` : `${process.env.HOST}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result;
  }

  public async uploadVideoHls(req: Request, res: Response) {
    const uploadedVideos = await handleUploadVideoHls(req, res);
    const result: Media[] = await Promise.all(
      uploadedVideos.map(async video => {
        const newNameFile = getNameWithoutExtension(video.newFilename);
        // await encodeHLSWithMultipleVideoStreams(video.filepath);
        // await deleteFileAfterUpload(video.filepath);
        queue.enqueue(video.filepath);
        return {
          url: checkEnv("dev") ? `http://localhost:${process.env.PORT}/static/video-hls/${newNameFile}/master.m3u8` : `${process.env.HOST}/static/video/${newNameFile}/master.m3u8`,
          type: MediaType.Video
        }
      })
    );
    return result;
  }
}

const mediaService = new MediaService();
export default mediaService;