import fs from "fs";
import path from "path";

export const UploadsFileDir = path.resolve('uploads');
export const ImagesDir = path.resolve(UploadsFileDir, 'images');
export const VideosDir = path.resolve(UploadsFileDir, 'videos');

export const initUploadsDir = () => {
  if (!fs.existsSync(UploadsFileDir)) {
    fs.mkdirSync(ImagesDir, { recursive: true });
    fs.mkdirSync(VideosDir, { recursive: true });
  }
}