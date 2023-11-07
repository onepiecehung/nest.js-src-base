class ConvertC {
  public jsonToSRT(items) {
    if (items.length === 0) {
      return "";
    }

    let convertedOutput = "";
    let subtitleIndex = 1;
    let currentStart = items[0].startTime;
    let formattedStart;
    let formattedEnd;
    let nextLine = "";

    items.forEach((item, index) => {
      if (item.type === "punctuation") {
        nextLine = nextLine.slice(0, -1); //Remove the space before punctuation
        nextLine += item.content;
        formattedStart = this.secondsToMinutes(currentStart);
        formattedEnd = this.secondsToMinutes(items[index - 1].endTime);
        convertedOutput += `${subtitleIndex++}\n`;
        convertedOutput += formattedStart + " --> " + formattedEnd + "\n";
        convertedOutput += nextLine + "\n\n";
        nextLine = "";
        let nextItem = items[index + 1];
        if (nextItem) {
          currentStart = items[index + 1].startTime;
        }
      } else if (item.endTime - currentStart > 5 && items[index - 1]) {
        formattedStart = this.secondsToMinutes(currentStart);
        formattedEnd = this.secondsToMinutes(items[index - 1].endTime);
        convertedOutput += `${subtitleIndex++}\n`;
        convertedOutput += formattedStart + " --> " + formattedEnd + "\n";
        convertedOutput += nextLine + "\n\n";
        nextLine = item.content + " ";
        currentStart = item.startTime;
      } else {
        nextLine += item.content + " ";
      }
    });

    formattedStart = this.secondsToMinutes(currentStart);
    if (items[items.length - 1].type !== "punctuation") {
      formattedEnd = this.secondsToMinutes(items[items.length - 1].endTime);
    } else {
      formattedEnd = this.secondsToMinutes(items[items.length - 2].endTime);
    }

    if (nextLine) {
      convertedOutput += `${subtitleIndex++}\n`;
      convertedOutput += formattedStart + " --> " + formattedEnd + "\n";
      convertedOutput += nextLine; //Add any leftover words to the end
    }

    return convertedOutput;
  }

  public padString(string, length) {
    return (new Array(length + 1).join("0") + string).slice(-length);
  }

  public secondsToMinutes(seconds) {
    let hours;
    let minutes;
    hours = Math.floor(seconds / 3600);
    seconds = seconds - hours * 3600;
    minutes = Math.floor(seconds / 60);
    seconds = (seconds - minutes * 60).toFixed(3);
    return (
      this.padString(hours, 2) +
      ":" +
      this.padString(minutes, 2) +
      ":" +
      this.padString(seconds, 6)
    );
  }

  public srtToJSON(data) {
    let originalData = data;
    let dataArray = this.tryComma(originalData);
    if (dataArray.length == 0) {
      dataArray = this.tryDot(originalData);
    }
    let items = [];
    for (let i = 0; i < dataArray.length; i += 4) {
      const startTime = this.correctFormat(dataArray[i + 1].trim());
      const endTime = this.correctFormat(dataArray[i + 2].trim());
      let new_line = {
        id: dataArray[i].trim(),
        startTime,
        startSeconds: this.timestampToSeconds(startTime),
        endTime,
        endSeconds: this.timestampToSeconds(endTime),
        text: dataArray[i + 3].trim(),
      };
      items.push(new_line);
    }
    return items;
  }

  seperator = ",";
  timestampToSeconds(srtTimestamp) {
    const [rest, millisecondsString] = srtTimestamp.split(",");
    const milliseconds = parseInt(millisecondsString);
    const [hours, minutes, seconds] = rest.split(":").map((x) => parseInt(x));
    const result = milliseconds * 0.001 + seconds + 60 * minutes + 3600 * hours;
    // fix odd JS roundings, e.g. timestamp '00:01:20,460' result is 80.46000000000001
    return Math.round(result * 1000) / 1000;
  }
  correctFormat(time) {
    // Fix the format if the format is wrong
    // 00:00:28.9670 Become 00:00:28,967
    // 00:00:28.967  Become 00:00:28,967
    // 00:00:28.96   Become 00:00:28,960
    // 00:00:28.9    Become 00:00:28,900
    // 00:00:28,96   Become 00:00:28,960
    // 00:00:28,9    Become 00:00:28,900
    // 00:00:28,0    Become 00:00:28,000
    // 00:00:28,01   Become 00:00:28,010
    // 0:00:10,500   Become 00:00:10,500
    let str = time.replace(".", ",");
    let hour = null;
    let minute = null;
    let second = null;
    let millisecond = null;
    // Handle millisecond
    let [front, ms] = str.split(",");
    millisecond = this.fixedStrDigit(3, ms);
    // Handle hour
    let [a_hour, a_minute, a_second] = front.split(":");
    hour = this.fixedStrDigit(2, a_hour, false);
    minute = this.fixedStrDigit(2, a_minute, false);
    second = this.fixedStrDigit(2, a_second, false);
    return `${hour}:${minute}:${second},${millisecond}`;
  }
  /*
    // make sure string is 'how_many_digit' long
    // if str is shorter than how_many_digit, pad with 0
    // if str is longer than how_many_digit, slice from the beginning
    // Example:
  
    Input: fixedStrDigit(3, '100')
    Output: 100
    Explain: unchanged, because "100" is 3 digit
  
    Input: fixedStrDigit(3, '50')
    Output: 500
    Explain: pad end with 0
  
    Input: fixedStrDigit(3, '50', false)
    Output: 050
    Explain: pad start with 0
  
    Input: fixedStrDigit(3, '7771')
    Output: 777
    Explain: slice from beginning
    */
  fixedStrDigit(how_many_digit, str, padEnd = true) {
    if (str.length == how_many_digit) {
      return str;
    }
    if (str.length > how_many_digit) {
      return str.slice(0, how_many_digit);
    }
    if (str.length < how_many_digit) {
      if (padEnd) {
        return str.padEnd(how_many_digit, "0");
      } else {
        return str.padStart(how_many_digit, "0");
      }
    }
  }
  tryComma(data) {
    data = data.replace(/\r/g, "");
    let regex =
      /(\d+)\n(\d{1,2}:\d{2}:\d{2},\d{1,3}) --> (\d{1,2}:\d{2}:\d{2},\d{1,3})/g;
    let dataArray = data.split(regex);
    dataArray.shift(); // remove first '' in array
    return dataArray;
  }

  tryDot(data) {
    data = data.replace(/\r/g, "");
    let regex =
      /(\d+)\n(\d{1,2}:\d{2}:\d{2}\.\d{1,3}) --> (\d{1,2}:\d{2}:\d{2}\.\d{1,3})/g;
    let dataArray = data.split(regex);
    dataArray.shift(); // remove first '' in array
    this.seperator = ".";
    return dataArray;
  }

  // toSrt(data) {
  //   let res = "";
  //   const end_of_line = "\r\n";
  //   for (let i = 0; i < data.length; i++) {
  //     let s = data[i];
  //     res += s.id + end_of_line;
  //     res += s.startTime + " --> " + s.endTime + end_of_line;
  //     res += s.text.replace("\n", end_of_line) + end_of_line + end_of_line;
  //   }
  //   return res;
  // }
}

export const Convert = new ConvertC();
