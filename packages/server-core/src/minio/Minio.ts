import Minio from "minio";
import { env } from "../env.js";

export const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: true,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
