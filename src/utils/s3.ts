import { S3 } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const s3 = new S3({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
})

s3.listBuckets({}).then((data) => {
  console.log(data);
});