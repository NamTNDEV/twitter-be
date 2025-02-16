import { deleteFileAfterUpload } from "./file";
import { encodeHLSWithMultipleVideoStreams } from "./video";

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

  public enqueue(item: string) {
    this.items.push(item);
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
    if (!videoPath) return;

    try {
      console.log(`🚀 Encoding started: ${videoPath}`);
      await encodeHLSWithMultipleVideoStreams(videoPath);
      await deleteFileAfterUpload(videoPath);
      console.log(`✅ Encoding success: ${videoPath}`);
    } catch (error) {
      console.error(`❌ Encoding error: ${videoPath}`, error);
    }

    this.isEncoding = false;
    this.processEncoding();
  }
}