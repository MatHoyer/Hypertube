import { Client } from "minio";
import { env } from "../env.js";

export const minio = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
});

const REMOVE_BATCH = 1000;

export async function removeObjectsByPrefix(
  bucketName: string,
  prefix: string
): Promise<void> {
  const normalized = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const names: string[] = [];
  const stream = minio.listObjects(bucketName, normalized, true);
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
    await minio.removeObjects(bucketName, chunk);
  }
}
