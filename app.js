const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

const error = chalk.bold.red;
const warning = chalk.keyword("orange");
const success = chalk.keyword("green");

var scraper = async () => {
  try {
    var browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36"
    );
    // body > div.container-fluid > div > div.intro.clearfix > div > ul > li:nth-last-child(2)
    await page.goto(`https://www.sih.gov.in/sih2019ProblemStatements?page=1`);
    await page.waitForSelector(
      "body>div.container-fluid>div>div.intro.clearfix>div>ul>li:nth-last-child(2)>a"
    );
    const pageCount = await page.evaluate(() =>
      parseInt(
        document
          .querySelector(
            "body>div.container-fluid>div>div.intro.clearfix>div>ul>li:nth-last-child(2)>a"
          )
          .innerText.trim(),
        10
      )
    );
    var ideaList = [];
    for (let page_no = 1; page_no <= pageCount; page_no++) {
      await page.goto(
        `https://www.sih.gov.in/sih2019ProblemStatements?page=${page_no}`,
        {
          timeout: 3000000
        }
      );
      await page.waitForSelector("#table_id_info");
      const ideaCount = await page.evaluate(() =>
        parseInt(
          document
            .querySelector("#table_id_info")
            .innerText.trim()
            .slice(13, 15),
          10
        )
      );
      console.log(ideaCount);

      //   const modals = await page.evaluate(() =>
      //     document.querySelectorAll(
      //       "#settings > thead > tr:nth-child(1) > td >div"
      //     )
      //   );
      //   console.log(modals[1]);

      for (var idea = 1; idea <= ideaCount; idea++) {
        console.log(idea);

        const ideaName = await page.evaluate(idea => {
          console.log(idea);
          var ideaObject = {};
          var modalDescriptions = document.querySelectorAll(
            "#settings > thead > tr:nth-child(1) > td >div"
          );

          var modalYoutube = document.querySelectorAll(
            "#settings > thead > tr:nth-child(5) > td >a"
          );
          if (typeof modalDescriptions[idea - 1] != "undefined") {
            ideaObject.description = modalDescriptions[
              idea - 1
            ].innerText.trim();
          }
          if (typeof modalYoutube[idea - 1] != "undefined") {
            ideaObject.youtubeLink = modalYoutube[idea - 1].innerText.trim();
          }
          ideaObject.title = document
            .querySelector(
              `#table_id > tbody > tr:nth-child(${idea}) > td:nth-child(3)`
            )
            .innerText.trim();
          ideaObject.organisation = document
            .querySelector(
              `#table_id > tbody > tr:nth-child(${idea}) > td:nth-child(2)`
            )
            .innerText.trim();
          ideaObject.category = document
            .querySelector(
              `#table_id > tbody > tr:nth-child(${idea}) > td:nth-child(4)`
            )
            .innerText.trim();
          ideaObject.bucket = document
            .querySelector(
              `#table_id > tbody > tr:nth-child(${idea}) > td:nth-child(6)`
            )
            .innerText.trim();
          ideaObject.complexity = document
            .querySelector(
              `#table_id > tbody > tr:nth-child(${idea}) > td:nth-child(7)`
            )
            .innerText.trim();
          return ideaObject;
        }, idea);
        console.log(ideaName);
        ideaList.push(ideaName);
      }
    }
    fs.writeFile("sih.json", JSON.stringify(ideaList), function(err) {
      if (err) throw err;
      console.log("Saved!");
    });

    await browser.close();
    console.log(success("Browser Closed"));
  } catch (err) {
    console.log(error(err));
    await browser.close();
    console.log(error("Browser Closed"));
  }
};

scraper();