import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { Response } from "express";
import { HTTP_STATUS } from "~/constants/httpStatus";
import envConfig from "~/constants/config";

const s3 = new S3({
  region: envConfig.aws.AWS_REGION as string,
  credentials: {
    accessKeyId: envConfig.aws.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: envConfig.aws.AWS_SECRET_ACCESS_KEY as string
  }
})

export const uploadFileToS3 = ({
  fileName,
  filePath,
  contentType
}: {
  fileName: string,
  filePath: string,
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: envConfig.aws.S3_BUCKET_NAME as string,
      Key: fileName,
      Body: fs.readFileSync(filePath),
      ContentType: contentType,
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

  return parallelUploads3.done();
}

export const sendFileFromS3 = async (res: Response, filePath: string) => {
  try {
    const data = await s3.getObject({
      Bucket: envConfig.aws.S3_BUCKET_NAME as string,
      Key: filePath
    })
      ; (data.Body as any).pipe(res);
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send("File not found");
  }
};