const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const sqlite3 = require('sqlite3').verbose();

// scrape function to get article data
async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.theverge.com/');

  const articleData = [];

  const html = await page.content();
  const $ = cheerio.load(html);

  $('article').each((i, el) => {
    const headline = $(el).find('h2').text().trim();
    const url = $(el).find('a').attr('href');
    const author = $(el).find('.c-byline__item').first().text().trim();
    const date = $(el).find('.c-byline__item').last().text().trim();

    // create article object and add it to array
    const article = {
      id: i + 1,
      url: url,
      headline: headline,
      author: author,
      date: date
    };
    articleData.push(article);
  });

  browser.close();
}