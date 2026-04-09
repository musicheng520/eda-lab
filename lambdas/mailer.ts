import { SQSHandler } from "aws-lambda";
import { SES_EMAIL_FROM, SES_EMAIL_TO, SES_REGION } from "../env";
import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

const client = new SESClient({ region: SES_REGION });

export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);
    const snsMessage = JSON.parse(recordBody.Message);

    if (snsMessage.Records) {
      for (const s3Message of snsMessage.Records) {
        const s3e = s3Message.s3;
        const srcBucket = s3e.bucket.name;

        const srcKey = decodeURIComponent(
          s3e.object.key.replace(/\+/g, " ")
        );

        try {
          const params = {
            Destination: {
              ToAddresses: [SES_EMAIL_TO],
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: `<h2>New Image Uploaded</h2><p>s3://${srcBucket}/${srcKey}</p>`,
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: "New image upload",
              },
            },
            Source: SES_EMAIL_FROM,
          };

          await client.send(new SendEmailCommand(params));

          console.log("Email sent for:", srcKey);
        } catch (error) {
          console.log("Email error:", error);
        }
      }
    }
  }
};