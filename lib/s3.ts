import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.ashref.tn';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'clearsprint-docs';
const S3_REGION = process.env.S3_REGION || 'auto';

export const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for Minio/S3 compatible usually
});

export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const key = `${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    // Ensure bucket exists
    try {
      await s3Client.send(command);
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchBucket') {
        console.log(`Bucket ${S3_BUCKET_NAME} does not exist. Creating...`);
        await s3Client.send(
          new CreateBucketCommand({ Bucket: S3_BUCKET_NAME }),
        );
        // Retry upload
        await s3Client.send(command);
      } else {
        throw error;
      }
    }

    // Return the URL to access the file
    return `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to storage');
  }
}

export async function getFileFromS3(key: string): Promise<Buffer> {
  // If the key is a full URL, extract the key
  let actualKey = key;
  if (key.startsWith(S3_ENDPOINT)) {
    const parts = key.split(`${S3_BUCKET_NAME}/`);
    if (parts.length > 1) {
      actualKey = parts[1];
    }
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: actualKey,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error('File body is empty');
    }
    // Convert stream to buffer
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw new Error('Failed to retrieve file from storage');
  }
}
