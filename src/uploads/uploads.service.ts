import Jimp from "jimp";
import * as moment from "moment-timezone";
import { AWSService } from "src/aws/aws.service";
import { Convert } from "src/utils/common/convert.common";
import { AxiosService } from "src/utils/http/axios.service";
import { Response } from "src/utils/interface/response.interface";
import { QueryRunner, Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Upload } from "./entities/upload.entity";
import { FOLDER_CONSTANT, UPLOAD_STATUS } from "./uploads.constant";
import { UploadsErrorMessage } from "./uploads.error";

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload) private uploadRepository: Repository<Upload>,
    private awsService: AWSService,
    private axiosService: AxiosService,
  ) {}

  truncateString(text: string = "") {
    text = text.toLowerCase();
    text = text.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, "");
    text = text.replace(/^-*|-*$|(-)-*/g, "$1");
    return text;
  }

  randomString() {
    return (Math.random() + 1).toString(36).substring(7);
  }

  async upload(
    fileUpload: Express.Multer.File,
    folder: FOLDER_CONSTANT = FOLDER_CONSTANT.COMMON,
    queryRunner?: QueryRunner,
  ): Promise<Upload> {
    const fileName = this.awsService.truncateString(fileUpload.originalname);
    const key: string = `${folder}/${moment().format(
      "YYYY/MM",
    )}/${Date.now()}-${fileName}`;

    const result = await this.awsService.uploadFile(fileUpload, key);
    if (!result) throw Response.error(UploadsErrorMessage.uploadFailed());

    const data = this.uploadRepository.create({
      url: result.Location,
      key,
      name: fileUpload.originalname,
      fileType: fileUpload?.mimetype,
    });

    let upload: Upload;
    if (queryRunner) {
      upload = await queryRunner.manager.save(data);
    } else {
      upload = await this.uploadRepository.save(data);
    }

    if (fileUpload?.originalname?.slice(-4) === ".srt") {
      const subtitles = await this.srtToJSON(data.url);
      upload["subtitles"] = subtitles;
    }

    return upload;
  }

  async findById(id: number, queryRunner?: QueryRunner): Promise<Upload> {
    let data;
    if (queryRunner) {
      data = await queryRunner.manager.findOne(Upload, {
        where: {
          id,
          status: UPLOAD_STATUS.ACTIVE,
        },
      });
    } else {
      data = await this.uploadRepository.findOne({
        where: {
          id,
          status: UPLOAD_STATUS.ACTIVE,
        },
      });
    }

    if (!data) {
      throw Response.error(UploadsErrorMessage.notFound());
    }

    return data;
  }

  async remove(id: number, queryRunner?: QueryRunner): Promise<void> {
    let data: Upload;
    if (queryRunner) {
      data = await queryRunner.manager.findOne(Upload, {
        where: {
          id,
          status: UPLOAD_STATUS.ACTIVE,
        },
      });
    } else {
      data = await this.uploadRepository.findOne({
        where: {
          id,
          status: UPLOAD_STATUS.ACTIVE,
        },
      });
    }

    const promise = [this.awsService.deleteFile(data.key)];
    if (queryRunner) {
      promise.push(queryRunner.manager.softDelete(Upload, id));
    } else {
      promise.push(this.uploadRepository.softDelete(id));
    }
    if (data) {
      await Promise.all(promise);
    }
  }

  // async uploadSrt(srt, queryRunner: QueryRunner) {
  //   const file = {
  //     mimetype: "application/x-subrip",
  //     buffer: Buffer.from(srt),
  //   };

  //   const key = "srt/" + Date.now() + ".srt";
  //   const result = await this.awsService.uploadFile(file, key);
  //   if (!result) throw Response.error(UploadsErrorMessage.uploadFailed());

  //   const data = this.uploadRepository.create({
  //     url: result.Location,
  //     key,
  //     name: key,
  //     fileType: file?.mimetype,
  //   });

  //   return queryRunner.manager.save(data);
  // }

  async createMultiPart(body: any) {
    return this.awsService.createMultipartUpload(body);
  }

  async completeMultiPart(body: any) {
    const result = await this.awsService.completeMultiPart(body);
    if (!result) throw Response.error(UploadsErrorMessage.uploadFailed());

    const data = this.uploadRepository.create({
      url: result.Location,
      key: result.Key,
      name: body?.fileName,
    });

    const upload = await this.uploadRepository.save(data);

    const presigned = await this.getPresignedUrlDownload(upload.id);

    upload.url = presigned?.url;
    return upload;
  }

  async getPresignedUrlUpload(body: any) {
    return this.awsService.getPresignedUrlUpload(body);
  }

  async getPresignedUrlDownload(id: number): Promise<{ url: string }> {
    const upload = await this.findById(id);
    return this.awsService.getPresignedUrlDownload(upload);
  }

  async abortMultiPart(body: any) {
    return this.awsService.abortMultiPart(body);
  }

  async uploadBlurPhoto(
    keyOrigin: string,
    folder: FOLDER_CONSTANT = FOLDER_CONSTANT.COMMON,
    queryRunner?: QueryRunner,
  ): Promise<Upload> {
    const bufferOrigin = await this.awsService.getBufferFromKey(keyOrigin);
    if (!bufferOrigin) throw Response.error(UploadsErrorMessage.notFound());

    const image = await Jimp.read(bufferOrigin);
    const blur = image.blur(30);
    const buffer = await blur.getBufferAsync(image._originalMime);

    const fileName = this.randomString();
    const key: string = `blurphoto/${moment().format(
      "YYYY/MM",
    )}/${Date.now()}-${fileName}`;

    const result = await this.awsService.uploadFile(
      {
        buffer,
        mimetype: image._originalMime,
      },
      key,
    );
    if (!result) throw Response.error(UploadsErrorMessage.uploadFailed());

    const data = this.uploadRepository.create({
      url: result.Location,
      key,
      name: fileName,
      fileType: image._originalMime,
    });

    if (queryRunner) {
      return queryRunner.manager.save(data);
    } else {
      return this.uploadRepository.save(data);
    }
  }

  async srtToJSON(url: string) {
    const response = await this.axiosService
      .get(url, { responseType: "arraybuffer" })
      .catch((err) => {
        throw Response.error(UploadsErrorMessage.fileUploadIsEmpty());
      });
    const buffer = Buffer.from(response.data, "utf-8");

    const srt = buffer.toString();

    const subtitles = Convert.srtToJSON(srt);
    return subtitles;
  }
}
