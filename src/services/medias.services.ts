import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import { MediaType } from "~/constants/enums";
import { Media } from "~/models/Other";
import { checkEnv } from "~/utils/env.ultis";
import { deleteFileAfterUpload, getNameWithoutExtension, handleUploadFile, ImagesDir } from "~/utils/file";

class MediaService {
  public async uploadImage(req: Request, res: Response) {
    const files = await handleUploadFile(req, res);
    const result: Media[] = await Promise.all(
      files.map(async file => {
        const newNameFile = getNameWithoutExtension(file.newFilename);
        const decoratedFilename = `${newNameFile}.jpg`;
        const uploadPath = path.resolve(ImagesDir, decoratedFilename);
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
}

const mediaService = new MediaService();
export default mediaService;