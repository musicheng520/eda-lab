import { SQSHandler } from "aws-lambda";
import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);

    // S3 event is inside SQS message
    if (recordBody.Records) {
      console.log("Record body ", JSON.stringify(recordBody));

      for (const messageRecord of recordBody.Records) {
        const s3e = messageRecord.s3;

        const srcBucket = s3e.bucket.name;

        // Handle spaces and special characters
        const srcKey = decodeURIComponent(
          s3e.object.key.replace(/\+/g, " ")
        );

        try {
          const params: GetObjectCommandInput = {
            Bucket: srcBucket,
            Key: srcKey,
          };

          // Download image (for demo purpose)
          const image = await s3.send(new GetObjectCommand(params));

          console.log("Image fetched successfully:", srcKey);
        } catch (error) {
          console.log("Error fetching image:", error);
        }
      }
    }
  }
};