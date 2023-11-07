// import { Auth } from "src/auth/decorators/auth.decorator";
// import { ADMIN_PERMISSION } from "src/auth/permissions/permission";
import {
  ISuccessResponse,
  Response,
} from "src/utils/interface/response.interface";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";

import { UploadsService } from "./uploads.service";
import { MAX_FILE_SIZE } from "src/utils/constant/constant";

@ApiTags("Uploads")
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // @Auth(ADMIN_PERMISSION)
  @Post("create-multipart")
  async createMultiPart(@Body() body: any) {
    return await this.uploadsService.createMultiPart(body);
  }

  // @Auth(ADMIN_PERMISSION)
  @Post("complete-multipart")
  async completeMultiPart(@Body() body: any) {
    return await this.uploadsService.completeMultiPart(body);
  }

  // @Auth(ADMIN_PERMISSION)
  @Post("get-presigned-url")
  async getPresignedUrlUpload(@Body() body: any) {
    return await this.uploadsService.getPresignedUrlUpload(body);
  }

  // @Auth(ADMIN_PERMISSION)
  @Post("abort-multipart")
  async abortMultiPart(@Body() body: any) {
    return await this.uploadsService.abortMultiPart(body);
  }

  // @Auth()
  @Get("get-presigned-url/:id")
  async getPresignedUrlDownload(@Param("id", ParseIntPipe) id: number) {
    const result = await this.uploadsService.getPresignedUrlDownload(id);
    return Response.success(result);
  }

  // @Auth()
  @Post()
  @UseInterceptors(
    FileInterceptor("fileUpload", { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  async upload(
    @UploadedFile() fileUpload: Express.Multer.File,
  ): Promise<ISuccessResponse> {
    const result = await this.uploadsService.upload(fileUpload);
    return Response.success(result);
  }

  // @Auth(ADMIN_PERMISSION)
  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ISuccessResponse> {
    const result = await this.uploadsService.findById(+id);
    return Response.success(result);
  }

  // @Auth(ADMIN_PERMISSION)
  @Delete(":id")
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ISuccessResponse> {
    await this.uploadsService.remove(+id);
    return Response.success();
  }
}
