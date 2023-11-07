// import * as moment from "moment-timezone";
// import { PRODUCT_TYPE } from "src/products/products.constant";

export class ColumnNumberTransformer {
  public to(data: number): number {
    return data;
  }

  public from(data: string): number {
    return Number(data);
  }
}

export function createContentId(
  perfix: string,
  date: Date,
  id: number,
): string {
  return `${perfix}${new Date(date)
    .getFullYear()
    .toString()
    .slice(-2)}${normalizeId(id)}`;
}

export function normalizeId(id: number): string {
  return `${id}`.padStart(3, "0");
}

// export function generateCode(type: PRODUCT_TYPE | "EVENT", id: number) {
//   let code = "";
//   switch (type) {
//     case PRODUCT_TYPE.VOD:
//       code = "V";
//       break;
//     case PRODUCT_TYPE.PHOTO:
//       code = "P";
//       break;
//     default:
//       code = "E";
//       break;
//   }

//   return `${code}${moment().format("YY")}${id.toString().padStart(3, "0")}`;
// }

export class RawQueryC {
  async loadRawQuery(result, repository, appendSelects) {
    if (appendSelects && result?.length) {
      const idField =
        repository.metadata.primaryColumns[0]?.propertyName || "id";
      const ids = result?.map((item, index) => item[idField]);
      const tableName = repository.metadata.tableName;
      const q = repository
        .createQueryBuilder(tableName)
        .where(`${idField} in (:ids)`, { ids })
        .select("*");
      Object.keys(appendSelects).forEach((s) => {
        q.addSelect(`(${appendSelects[s]}) as ${s}`);
      });
      const data = await q.getRawMany();
      result?.forEach((item) => {
        const row = data.filter((i: any) => i.id === item.id)[0] ?? {};
        Object.keys(appendSelects).forEach((s) => (item[s] = row[s] ?? null));
      });
    }
  }

  async loadRankComments(result, repository, appendSelect: string) {
    if (appendSelect && result?.length) {
      const ids = result?.map((item) => item["id"]);
      const tableName = repository.metadata.tableName;
      const q = repository
        .createQueryBuilder(tableName)
        .leftJoin(
          `(select id,
            ROW_NUMBER() OVER (PARTITION BY comments.productId 
            ORDER BY comments.price DESC, comments.createdAt DESC) commentsRank 
            from comments where deletedAt is null)`,
          `subC`,
          `subC.id = comments.id`,
        )
        .where(`comments.id in (:ids)`, { ids })
        .select("*");
      q.addSelect(`commentsRank`);

      const data = await q.getRawMany();
      result?.forEach((item) => {
        const row = data.filter((i: any) => i.id === item.id)[0] ?? {};
        item["commentsRank"] = row["commentsRank"] ?? null;
      });
    }
  }
}
export const RawQuery = new RawQueryC();
