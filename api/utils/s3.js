import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({ region: "us-east-1" });
const S3_BUCKET = process.env.S3_BUCKET;

const uploadFile = (file, key) => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  return s3.send(command);
};

const uploadToS3 = async ({ files, postId }) => {
  const promises = [];
  const keys = [];
  for (let i = 0; i < Math.min(files.length, 5); i++) {
    const file = files[i];
    const key = `${postId}/${uuidv4()}`;
    keys.push(key);
    promises.push(uploadFile(file, key));
  }

  try {
    await Promise.all(promises);
    return { keys };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const deleteFile = (key) => {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });
  return s3.send(command);
};

const deleteFromS3 = async (keys) => {
  const promises = [];
  for (let i = 0; i < Math.min(keys.length, 5); i++) {
    const key = decodeURIComponent(keys[i]);
    promises.push(deleteFile(key));
  }

  try {
    await Promise.all(promises);
    return { result: "File(s) successfully deleted" };
  } catch (error) {
    return { error };
  }
};

const getImageKeysByPost = async (postId) => {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: postId,
  });

  const { Contents = [] } = await s3.send(command);

  return Contents.map((image) => image.Key);
};

const getPresignedUrls = async (postId) => {
  try {
    const imageKeys = await getImageKeysByPost(postId);

    const presignedUrls = await Promise.all(
      imageKeys.map((key) => {
        const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
        return getSignedUrl(s3, command, { expiresIn: 900 });
      })
    );

    return { presignedUrls };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export { uploadToS3, deleteFromS3, getPresignedUrls };
