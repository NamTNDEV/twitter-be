import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import db from "~/configs/db.configs";
import { EncodingStatus, MediaType } from "~/constants/enums";
import { Media } from "~/models/Other";
import VideoStatus from "~/models/schemas/VideoStatus.schemas";
import { deleteFileAfterUpload, getNameWithoutExtension, handleUploadImages, handleUploadVideo, handleUploadVideoHls, imagesPath, } from "~/utils/file";
import { Queue } from "~/utils/queue";
import fsPromise from 'fs/promises'
import { uploadFileToS3 } from "~/utils/s3";
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import mime from 'mime';
import envConfig from "~/constants/config";

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
          fileName: 'images/' + decoratedFilename,
          filePath: uploadPath,
          contentType: mime.getType(uploadPath) as string
        });
        Promise.all([
          fsPromise.unlink(file.filepath),
          fsPromise.unlink(uploadPath)
        ])
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
    const s3Results: Media[] = await Promise.all(
      await uploadedVideos.map(async file => {
        const s3Result = await uploadFileToS3({
          fileName: 'videos/' + file.newFilename,
          filePath: file.filepath,
          contentType: mime.getType(file.filepath) as string
        });
        deleteFileAfterUpload(file.filepath);
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )
    return s3Results;
  }

  public async uploadVideoHls(req: Request, res: Response) {
    const uploadedVideos = await handleUploadVideoHls(req, res);
    const result: Media[] = await Promise.all(
      uploadedVideos.map(async video => {
        const newNameFile = getNameWithoutExtension(video.newFilename);
        queue.enqueue(video.filepath);
        return {
          url: `${envConfig.server.HOST}/static/video-hls/${newNameFile}/master.m3u8`,
          type: MediaType.HLS
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