import { Module } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { UploadsController } from "./uploads.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Upload } from "./entities/upload.entity";
import { AWSModule } from "src/aws/aws.module";
import { HttpModule } from "@nestjs/axios";
import { AxiosService } from "src/utils/http/axios.service";

@Module({
  imports: [TypeOrmModule.forFeature([Upload]), AWSModule, HttpModule],
  controllers: [UploadsController],
  providers: [UploadsService, AxiosService],
  exports: [UploadsService],
})
export class UploadsModule {}
