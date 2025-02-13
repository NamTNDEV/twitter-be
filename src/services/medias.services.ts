import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import { deleteFileAfterUpload, getNameWithoutExtension, handleUploadSingleImage, ImagesDir } from "~/utils/file";

class MediaService {
  public async uploadSingleImage(req: Request, res: Response) {
    const { newFilename, filepath } = await handleUploadSingleImage(req, res);
    const newNameFile = getNameWithoutExtension(newFilename);
    const decoratedFilename = `${newNameFile}.jpg`;
    const uploadPath = path.resolve(ImagesDir, decoratedFilename);
    await sharp(filepath).jpeg().toFile(uploadPath);
    deleteFileAfterUpload(filepath);
    return {
      uploadedUrl: `${req.protocol}://${req.get("host")}/images/${decoratedFilename}`,
    }
  }
}

const mediaService = new MediaService();
export default mediaService;