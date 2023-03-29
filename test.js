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

  // write data to CSV file
  const csvWriter = createCsvWriter({
    path: `${new Date().toLocaleDateString().replace(/\//g, '')}_verge.csv`,
    header: [
      { id: 'id', title: 'id' },
      { id: 'url', title: 'URL' },
      { id: 'headline', title: 'headline' },
      { id: 'author', title: 'author' },
      { id: 'date', title: 'date' },
    ]
  });
  await csvWriter.writeRecords(articleData);

  // insert data into SQLite database
  const db = new sqlite3.Database('articles.db');
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY, url TEXT, headline TEXT, author TEXT, date TEXT)');
    const stmt = db.prepare('INSERT INTO articles(id, url, headline, author, date) VALUES (?, ?, ?, ?, ?)');
    articleData.forEach((article) => {
      stmt.run(article.id, article.url, article.headline, article.author, article.date);
    });
    stmt.finalize();
  });
  db.close();
}

// run the scraper function
scrape();
