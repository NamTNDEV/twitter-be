import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import db from "~/configs/db.configs";
import { EncodingStatus, MediaType } from "~/constants/enums";
import { Media } from "~/models/Other";
import VideoStatus from "~/models/schemas/VideoStatus.schemas";
import { checkEnv } from "~/utils/env.ultis";
import { deleteFileAfterUpload, getNameWithoutExtension, handleUploadImages, handleUploadVideo, handleUploadVideoHls, imagesPath, } from "~/utils/file";
import { Queue } from "~/utils/queue";
import { encodeHLSWithMultipleVideoStreams } from "~/utils/video";
import fsPromise from 'fs/promises'
import { uploadFileToS3 } from "~/utils/s3";
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import mime from 'mime';

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

        const s3Result = await uploadFileToS3({
          fileName: decoratedFilename,
          filePath: uploadPath,
          contentType: mime.getType(uploadPath) as string
        });

        // deleteFileAfterUpload(file.filepath);
        Promise.all([
          fsPromise.unlink(file.filepath),
          fsPromise.unlink(uploadPath)
        ])
        // return {
        //   url: checkEnv("dev") ? `http://localhost:${process.env.PORT}/static/image/${decoratedFilename}` : `${process.env.HOST}/static/image/${decoratedFilename}`,
        //   type: MediaType.Image
        // }

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
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

  public async addNewVideoStatus(newVideStatus: VideoStatus) {
    await db.getVideoStatusCollection().insertOne(newVideStatus);
  }

  public async updateVideoStatus(videoId: string, newStatus: EncodingStatus) {
    await db.getVideoStatusCollection().updateOne({ name: videoId }, { $set: { status: newStatus }, $currentDate: { updatedAt: true } });
  }

  public async getVideoStatus(videoId: string) {
    return await db.getVideoStatusCollection().findOne({ name: videoId });
  }

}

const mediaService = new MediaService();
export default mediaService;