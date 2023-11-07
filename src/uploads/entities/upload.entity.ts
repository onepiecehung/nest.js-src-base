import { MAX_DECIMAL_PLACE } from "src/utils/constant/constant";
import { BaseEntityCustom } from "src/utils/entity/BaseEntity";
import { Column, Entity, Index } from "typeorm";
import { UPLOAD_STATUS } from "../uploads.constant";

@Entity({ name: "uploads" })
export class Upload extends BaseEntityCustom {
  @Index()
  @Column({ type: "enum", enum: UPLOAD_STATUS, default: UPLOAD_STATUS.ACTIVE })
  status: UPLOAD_STATUS;

  @Column("text", { nullable: true })
  url: string;

  @Column("text", { nullable: true })
  baseUrl: string;

  @Column("text", { nullable: true })
  key: string;

  @Column("text", { nullable: true })
  name: string;

  @Column("text", { nullable: true })
  fileType: string;

  @Column("int", { unsigned: true, nullable: true })
  width: number;

  @Column("int", { unsigned: true, nullable: true })
  height: number;

  @Column("decimal", {
    unsigned: true,
    default: 0,
    precision: 22,
    scale: MAX_DECIMAL_PLACE,
  })
  duration: number;
}
