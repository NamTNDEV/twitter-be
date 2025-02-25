import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { config } from "dotenv";
import path from "path";
import fs from "fs";

config();

const s3 = new S3({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
})

const testUploadFile = fs.readFileSync(path.resolve('uploads/images/twitter_logo.jpg'));

const parallelUploads3 = new Upload({
  client: s3,
  params: {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: 'test_02.jpg',
    Body: testUploadFile,
    ContentType: 'image/jpeg',
  },

  // optional tags
  tags: [
    /*...*/
  ],

  // additional optional fields show default values below:

  // (optional) concurrency configuration
  queueSize: 4,

  // (optional) size of each part, in bytes, at least 5MB
  partSize: 1024 * 1024 * 5,

  // (optional) when true, do not automatically call AbortMultipartUpload when
  // a multipart upload fails to complete. You should then manually handle
  // the leftover parts.
  leavePartsOnError: false,
});

parallelUploads3.on("httpUploadProgress", (progress) => {
  console.log("progress::: ", progress);
});

parallelUploads3.done().then((data) => {
  console.log("parallelUploads3::: ", data);
}).catch((error) => {
  console.error(error);
});