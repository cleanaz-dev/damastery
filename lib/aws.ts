
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const createCommand = ({
  functionName,
  payload,
  invocationType = "Event" as InvocationType
}: {
  functionName: string;
  payload: any;
  invocationType?: InvocationType;
}) =>
  new InvokeCommand({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  
export { s3Client, PutObjectCommand, createCommand, lambda};