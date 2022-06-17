const fs = require("fs");

const axios = require("axios").default;
const cheerio = require("cheerio");

function normal(sbd) {
  return sbd.toString().padStart(6, "0");
}

function crawlPoint(sbd) {
  console.log(normal(sbd));
  return axios
    .post(
      "http://portal.vinhphuc.edu.vn/?module=Content.Listing&moduleId=1013&cmd=redraw&site=105293&url_mode=rewrite&submitFormId=1013&moduleId=1013&page=&site=105293",
      `layout=Decl.DataSet.Detail.default&itemsPerPage=1&pageNo=1&service=Content.Decl.DataSet.Grouping.select&itemId=62aa935e526a66c89b08a662&gridModuleParentId=13&type=Decl.DataSet&page=&modulePosition=0&moduleParentId=-1&orderBy=&unRegex=&keyword=${normal(
        sbd
      )}&_t=1655405811399`,
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
          Connection: "keep-alive",
          Cookie:
            "be=77; AUTH_BEARER_default=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE2NTU0MDU2NDQsImp0aSI6IkpjdHlkT2JwT0x0WVdDNXVla2R3VVl6QWJmQ2R0c0sxRDdwS2VuVG5HNnM9IiwiaXNzIjoicG9ydGFsLnZpbmhwaHVjLmVkdS52biIsIm5iZiI6MTY1NTQwNTY0NCwiZXhwIjoxNjU1NDA5MjQ0LCJkYXRhIjoiY3NyZlRva2VufHM6NjQ6XCJiZjM0Y2IzNzU5MjIwNDkwZDc0ZWJjN2E1OTAzNTk3NGIzNjMxODdmODM3N2NlMjVlMDA4ZWViY2NkOWFkYzUxXCI7Z3Vlc3RJZHxzOjMyOlwiYWRhY2I5ZmFiYmY0NGRiOTE5MmY4YzEyMGZmN2I4OGJcIjt2aXNpdGVkMTA1MjkzfGk6MTY1NTQwNDIwNTsifQ.RkyFQ_lwD-vS2IWsji8PRtRTgPVhlEhPBGwJq3oy12hzmxMUMZOA_Dfo9Z5SC35xK7f3-UXrg8TTk8Zn4l2wBw",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )
    .then((res) => {
      const $ = cheerio.load(res.data);
      const tableText = $("table").text().split("\n");
      const dataLine = tableText[tableText.length - 1].trim().split("   ");
      const schema = {
        1: "SBD",
        5: "Van",
        6: "Toan",
        7: "Anh",
        8: "Ly",
        9: "Su",
        10: "To hop",
        11: "Mon chuyen",
      };
      const dataObject = {};
      Object.keys(schema).forEach((key) => {
        if (parseInt(key) >= 5)
          dataObject[schema[key]] = parseFloat(dataLine[key]);
        else dataObject[schema[key]] = dataLine[key];
      });
      console.log(dataObject["SBD"]);
      if (isNaN(dataObject["Van"])) return "";
      return dataLine.join(",") + "\n";
    });
}

function slowPush(counter) {
  if (counter <= 999999) {
    crawlPoint(counter)
      .then((dataLine) => {
        fs.appendFileSync("cvp.csv", dataLine);
        slowPush(counter + 1);
      })
      .catch((err) => {
        if (err.response) console.log(err.response.data);
        slowPush(counter + 1);
      });
  }
}

slowPush(085000);
