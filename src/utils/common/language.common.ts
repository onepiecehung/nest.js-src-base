import { isObject } from "lodash";
import { LANG_CODE } from "../constant/constant";
class FormatLanguageC {
  public convert(data: any) {
    const en = {
      language: LANG_CODE.EN,
    };
    const kr = {
      language: LANG_CODE.KR,
    };
    const cn = {
      language: LANG_CODE.CN,
    };

    for (let i in data) {
      if (isObject(data[i]) && !Array.isArray(isObject(data[i]))) {
        en[i] = data[i]?.en;
        kr[i] = data[i]?.kr;
        cn[i] = data[i]?.cn;
      }
    }
    return [en, kr, cn];
  }

  public revert(data: any, field: string[]) {
    if (data.languages && data.languages.length) {
      data.languages.forEach((item) => {
        field.forEach((i) => {
          if (!data[i]) data[i] = {};
          data[i][item?.language] = item[i];
        });
      });

      // delete data.languages;
      return data;
    }
  }

  public merge(data: any, dataNew: any) {
    return data.map((item) => {
      dataNew.forEach((itemNew) => {
        if (item.language === itemNew.language) {
          item = {
            ...item,
            ...itemNew,
          };
        }
      });

      return item;
    });
  }
}
export const FormatLanguage = new FormatLanguageC();
