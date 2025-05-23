import { deleteFileAfterUpload, getAllFiles, getNameWithoutExtension, videosPath } from "./file";
import { encodeHLSWithMultipleVideoStreams } from "./video";
import VideoStatus from "~/models/schemas/VideoStatus.schemas";
import { EncodingStatus } from "~/constants/enums";
import mediaService from "~/services/medias.services";
import path from "path";
import { uploadFileToS3 } from "./s3";
import mime from "mime";
import { rimrafSync } from "rimraf";

export class Queue {
  private static instance: Queue;
  private items: string[] = [];
  private isEncoding: boolean = false;

  private constructor() { }

  public static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue();
    }
    return Queue.instance;
  }

  public async enqueue(item: string) {
    this.items.push(item);
    const idName = getNameWithoutExtension(item.split("/").pop() || "");
    await mediaService.addNewVideoStatus(new VideoStatus({
      name: idName,
      status: EncodingStatus.Pending
    }));
    this.processEncoding();
  }
  private async processEncoding() {
    if (this.isEncoding) return;
    if (this.items.length === 0) {
      console.log("🎉 Encode video done!");
      return;
    }
    this.isEncoding = true;
    const videoPath = this.items.shift();
    const idName = getNameWithoutExtension((videoPath as string).split("/").pop() || "");
    if (!videoPath) return;
    try {
      await mediaService.updateVideoStatus(idName, EncodingStatus.Processing);
      console.log(`🚀 Encoding started: ${videoPath}`);
      await encodeHLSWithMultipleVideoStreams(videoPath);
      const allFiles = getAllFiles(path.resolve(videosPath, idName));
      await Promise.all(allFiles.map(willUploadFilePath => {
        const willUploadName = 'videos-hls' + willUploadFilePath.replace(path.resolve(videosPath), "");
        return uploadFileToS3({
          fileName: willUploadName,
          filePath: willUploadFilePath,
          contentType: mime.getType(willUploadFilePath) as string
        });
      }))
      rimrafSync(path.resolve(videosPath, idName));
      await mediaService.updateVideoStatus(idName, EncodingStatus.Completed);
      console.log(`✅ Encoding success: ${videoPath}`);
    } catch (error) {
      await mediaService.updateVideoStatus(idName, EncodingStatus.Failed).catch(
        (error) => console.error(`❌ Update status error: ${videoPath}`, error)
      );
      console.error(`❌ Encoding error: ${videoPath}`, error);
    }

    this.isEncoding = false;
    this.processEncoding();
  }
}