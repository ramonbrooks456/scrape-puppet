import puppeteer from "puppeteer";
import fetch from "node-fetch";

async function fetchData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function getImageLinks(x) {
  let finalImages = [];
  for (let i = 1; i < 3; i++) {
    finalImages.push(x + "images/" + i + ".jpg");
  }
  return finalImages;
}

function videoThumbs(x) {
  let finalThumbs = [];
  for (let i = 1; i < 3; i++) {
    finalThumbs.push(x + "thumbs/" + i + ".jpg");
  }
  return finalThumbs;
}

async function scrape(url) {
  let finalObj = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".list-group-item-action", {
    visible: true,
  });
  const mainLinks = await page.$$eval("a", (as) => {
    let finalMain = as.map((x) => x.href);
    return finalMain.slice(13).slice(0, -3);
  });
  for (const movie of mainLinks) {
    let main = await fetchData(movie + "/Info/info.json");
    main.images = getImageLinks(movie);
    await page.goto(movie + "videos");
    await page.waitForSelector(".list-group-item-action", {
      visible: true,
    });
    const videoLinks = await page.$$eval("a", (vid) => {
      let finalVideo = vid.map((x) => x.href);
      return finalVideo.slice(17).slice(0, -3);
    });
    let videoLnk = [];
    for (const video of videoLinks) {
      let videoObj = {};
      videoObj.thumbs = videoThumbs(video);
      videoObj.main = video + "videoMain/main.mp4";
      videoLnk.push(videoObj);
    }
    // console.log(videoLnk);
    main.videos = videoLnk;
    finalObj.push(main);
  }
  console.log(finalObj);
  await browser.close();
}

scrape("Enter URL here");
