import { BucketItemStat, ItemBucketMetadata } from "minio";
import { Readable } from "stream";
import { TBuckets } from "./const.js";

export interface IStorageService {
  getObject: (bucketName: TBuckets, objectName: string) => Promise<Readable>;
  getStatObject: (
    bucketName: TBuckets,
    objectName: string
  ) => Promise<BucketItemStat>;
  getPartialObject: (
    bucketName: TBuckets,
    objectName: string,
    offset: number,
    length?: number
  ) => Promise<Readable>;
  putObject: (
    bucketName: TBuckets,
    objectName: string,
    stream: string | Readable | Buffer<ArrayBufferLike>,
    size?: number,
    metaData?: ItemBucketMetadata
  ) => Promise<void>;
  removeObject: (bucketName: TBuckets, objectName: string) => Promise<void>;
}
