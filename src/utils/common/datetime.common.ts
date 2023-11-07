import * as moment from "moment-timezone";

class DateTimeHandle {
  public addQueryDate(
    queryBuilder: any,
    fromDate: any,
    toDate: any,
    table: string,
    fieldSearch: string = "createdAt",
  ) {
    if (fromDate) {
      fromDate = moment(fromDate).format("YYYY-MM-DD") + " 00:00:00";
      queryBuilder.andWhere(`${table}.${fieldSearch} >= '${fromDate}'`);
    }

    if (toDate) {
      toDate = moment(toDate).format("YYYY-MM-DD") + " 23:59:59";
      if (fromDate) {
        const time = `${table}.${fieldSearch} BETWEEN '${fromDate}' AND '${toDate}'`;
        queryBuilder.andWhere(time);
      } else {
        queryBuilder.andWhere(`${table}.${fieldSearch} <= '${toDate}'`);
      }
    }
  }

  // Function to convert UTC time to UTC+9 (Japan Standard Time)
  public convertUTCToUTCPlus9(utcTime: Date): Date {
    // Calculate the offset for UTC+9 in minutes
    const utcPlus9Offset = 9 * 60; // UTC+9 is 9 hours ahead, which is 9 hours * 60 minutes

    // Calculate the time in UTC+9 by adding the UTC+9 offset
    const utcPlus9Time = new Date(utcTime.getTime() + utcPlus9Offset * 60000);

    return utcPlus9Time;
  }
}

export const DateTime = new DateTimeHandle();
