import { Injectable } from "@nestjs/common";
import { InjectAwsService } from "nest-aws-sdk";
import { S3 } from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { Upload } from "src/uploads/entities/upload.entity";
import * as moment from "moment-timezone";

@Injectable()
export class AWSService {
  private AWS_BUCKET_NAME: string;
  constructor(
    private configService: ConfigService,
    @InjectAwsService(S3) private readonly s3: S3,
  ) {
    // this.checkConnection()
    this.AWS_BUCKET_NAME = this.configService.get<string>("AWS_BUCKET_NAME");
  }

  async checkConnection() {
    this.s3.listBuckets((err, data) => {
      if (err) {
        console.log("AWS INIT ERROR: ", err);
        throw err;
        //throw error aws connection error
      } else {
        //Get list of required bucket
        const requiredBuckets = [this.AWS_BUCKET_NAME];
        //Initialize bucket check existed object
        const bucketChecks = {};
        requiredBuckets.map((bucketName) => {
          bucketChecks[bucketName] = "required";
        });
        //Get list of current buckets on AWS account
        let bucketList = data.Buckets.map((bucket) => {
          return bucket.Name;
        });
        //Check if required buckets are existed or not
        bucketList.map((bucketName) => {
          if (bucketChecks[bucketName] === "required")
            bucketChecks[bucketName] = "existed";
        });
        //notice missing buckets
        for (const key in bucketChecks) {
          if (bucketChecks[key] === "required") {
            throw bucketChecks;
          }
        }
        console.log("bucketChecks", bucketChecks);
      }
    });
  }

  truncateString(text: string = "") {
    text = text.toLowerCase();
    text = text.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, "");
    text = text.replace(/^-*|-*$|(-)-*/g, "$1");
    return text;
  }

  public async uploadFile(
    file: any,
    key: string,
    bucket: string = this.AWS_BUCKET_NAME,
  ): Promise<any> {
    try {
      if (!file || !key) return true;
      const params: S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.mimetype,
      };

      return this.s3.upload(params).promise();
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getBufferFromKey(
    key: string,
    bucket: string = this.AWS_BUCKET_NAME,
  ): Promise<any> {
    try {
      if (!key) return false;

      const params: S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
      };

      const result = await this.s3.getObject(params).promise();

      return result.Body;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async deleteFile(
    key: string,
    bucket: string = this.AWS_BUCKET_NAME,
  ): Promise<any> {
    try {
      if (!key) return true;
      const params: S3.DeleteObjectRequest = { Bucket: bucket, Key: key };
      return this.s3.deleteObject(params).promise();
    } catch (error) {
      return false;
    }
  }

  public async getFile(key: string, bucket?: string): Promise<any> {
    try {
      if (!bucket) bucket = this.AWS_BUCKET_NAME;
      if (!key) return true;
      const params: S3.GetObjectRequest = { Bucket: bucket, Key: key };
      return this.s3.getObject(params).promise();
    } catch (error) {
      return false;
    }
  }

  async createMultipartUpload(body) {
    let setACL = "private";
    // if (body?.type === EPISODE_TYPE.TEASER) {
    //   setACL = "public-read";
    // }

    let folder = "video";
    // if (body?.productType === PRODUCT_TYPE.PHOTO) {
    //   folder = "photo";
    // }

    const params = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: `${folder}/${moment().format(
        "YYYY/MM",
      )}/${Date.now()}-${body?.name}`,
      ACL: setACL,
    };

    const result = await this.s3.createMultipartUpload(params).promise();

    return {
      fileId: result.UploadId,
      fileKey: result.Key,
    };
  }

  async completeMultiPart(body) {
    const { fileId, fileKey, parts } = body;

    const multipartParams = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: fileKey,
      UploadId: fileId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    };

    return this.s3.completeMultipartUpload(multipartParams).promise();
  }

  async getPresignedUrlUpload(body) {
    const { fileKey, fileId, parts } = body;

    const multipartParams = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: fileKey,
      UploadId: fileId,
      Expires: 1800,
    };

    const promises = [];

    for (let index = 0; index < parts; index++) {
      promises.push(
        this.s3.getSignedUrlPromise("uploadPart", {
          ...multipartParams,
          PartNumber: index + 1,
        }),
      );
    }

    const signedUrls = await Promise.all(promises);

    const partSignedUrlList = signedUrls.map((signedUrl, index) => {
      return {
        signedUrl: signedUrl,
        PartNumber: index + 1,
      };
    });

    return {
      parts: partSignedUrlList,
    };
  }

  async abortMultiPart(body) {
    const params = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: body.fileKey,
      UploadId: body.fileId,
    };

    return await this.s3.abortMultipartUpload(params).promise();
  }

  async getPresignedUrlDownload(upload: Upload): Promise<{ url: string }> {
    const { key } = upload;

    const params = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };

    const presignedGetUrl = this.s3.getSignedUrl("getObject", params);

    return {
      url: presignedGetUrl,
    };
  }
}
