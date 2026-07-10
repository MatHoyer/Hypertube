import { Client } from "minio";
import { env } from "../../env.js";
import { IStorageService } from "./IStorageService.js";

const REMOVE_BATCH = 1000;

const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
});

export class MinioStorageService implements IStorageService {
  minioClient: Client;

  constructor() {
    this.minioClient = minioClient;
  }

  getObject: IStorageService["getObject"] = async (bucketName, objectName) => {
    return await this.minioClient.getObject(bucketName, objectName);
  };

  statObject: IStorageService["statObject"] = async (
    bucketName,
    objectName
  ) => {
    return await this.minioClient.statObject(bucketName, objectName);
  };

  getPartialObject: IStorageService["getPartialObject"] = async (
    bucketName,
    objectName,
    offset,
    length
  ) => {
    return await this.minioClient.getPartialObject(
      bucketName,
      objectName,
      offset,
      length
    );
  };

  putObject: IStorageService["putObject"] = async (
    bucketName,
    objectName,
    stream,
    size,
    metaData
  ) => {
    await this.minioClient.putObject(
      bucketName,
      objectName,
      stream,
      size,
      metaData
    );
  };

  removeObject: IStorageService["removeObject"] = async (
    bucketName,
    objectName
  ) => {
    await this.minioClient.removeObject(bucketName, objectName);
  };

  removeObjectsByPrefix: IStorageService["removeObjectsByPrefix"] = async (
    bucketName,
    prefix
  ) => {
    const normalized = prefix.endsWith("/") ? prefix : `${prefix}/`;
    const names: string[] = [];
    const stream = minioClient.listObjects(bucketName, normalized, true);
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (obj: { name?: string; key?: string }) => {
        const key = obj.name ?? obj.key;
        if (key) names.push(key);
      });
      stream.on("error", reject);
      stream.on("end", () => resolve());
    });
    if (names.length === 0) return;
    for (let i = 0; i < names.length; i += REMOVE_BATCH) {
      const chunk = names.slice(i, i + REMOVE_BATCH);
      await minioClient.removeObjects(bucketName, chunk);
    }
  };

  presignedGetObject: IStorageService["presignedGetObject"] = async (
    bucketName,
    objectName
  ) => {
    return await this.minioClient.presignedGetObject(bucketName, objectName);
  };
}
