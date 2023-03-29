const puppeteer = require('puppeteer');

async function scrapeHeadline() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.theverge.com', { timeout: 60000 });


  const headlineElement = await page.$x('//*[@id="__next"]/div/div/main/div[4]/div/div[1]/div[2]/div[1]/div/ol/li[1]/a/h3');
  const headlineText = await page.evaluate(el => el.textContent, headlineElement[0]);
  const headlineUrlElement = await page.$x('//*[@id="__next"]/div/div/main/div[4]/div/div[1]/div[2]/div[1]/div/ol/li[1]/a');
  const headlineUrl = await page.evaluate(el => el.getAttribute('href'), headlineUrlElement[0]);

  const authorElement = await page.$x('//*[@id="__next"]/div/div/main/div[4]/div/div[1]/div[2]/div[1]/div/ol/li[1]/p/span[1]');
  const authorName = await page.evaluate(el => el.textContent, authorElement[0]);

  const dateElement = await page.$x('//*[@id="__next"]/div/div/main/div[4]/div/div[1]/div[2]/div[1]/div/ol/li[1]/p/span[2]');
  const publishedDate = await page.evaluate(el => el.textContent, dateElement[0]);

  console.log(headlineText);
  console.log(headlineUrl);
  console.log(authorName);
  console.log(publishedDate);

  await browser.close();
}

scrapeHeadline();
