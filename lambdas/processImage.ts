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
    const recordBody = JSON.parse(record.body);        // SQS
    const snsMessage = JSON.parse(recordBody.Message); // SNS

    if (snsMessage.Records) {
      for (const s3Message of snsMessage.Records) {
        const s3e = s3Message.s3;
        const srcBucket = s3e.bucket.name;

        const srcKey = decodeURIComponent(
          s3e.object.key.replace(/\+/g, " ")
        );

        try {
          const params: GetObjectCommandInput = {
            Bucket: srcBucket,
            Key: srcKey,
          };

          await s3.send(new GetObjectCommand(params));

          console.log("Processed via SNS:", srcKey);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};