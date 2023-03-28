const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const axios  = require('axios')

// Define the URL to scrape
const url = 'https://www.theverge.com/';

// Define the filename for the output CSV file
const csvFilename = moment().format('DDMMYYYY') + '_verge.csv';

// Define the database filename
const dbFilename = 'verge.db';

// Define the SQLite database connection
const db = new sqlite3.Database(dbFilename, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Define the SQL statement to create the articles table
const createTableSql = `CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY,
  url TEXT,
  headline TEXT,
  author TEXT,
  date TEXT
);`;

// Create the articles table in the database
db.run(createTableSql);

// Define the function to scrape the articles
const scrapeArticles = async () => {
  try {
    // Load the web page
    const response = await axios.get('https://www.theverge.com/');
    
    const $ = cheerio.load(response.data);

    // Find all article elements
    const articles = $('div.c-entry-box--compact');
    console.log(articles);

    // Extract the article data and store it in an array
    const articleData = [];
    articles.each((i, el) => {
      const article = $(el);

      // Extract the article data
      const headline = article.find('h2.c-entry-box--compact__title').text().trim();
      const url = article.find('a').attr('href');
      const author = article.find('span.c-byline__item').first().text().trim();
      const date = article.find('time').attr('datetime');
      // Create an object to store the article data
      const data = {
        headline,
        url,
        author,
        date
      };

      // Add the article data to the array
      articleData.push(data); 
      console.log(data.headline, data.url, data.author, data.date);

    });

    // Save the article data to a CSV file
    const csvData = articleData.map((article, i) => `${i},${article.url},${article.headline},${article.author},${article.date}`).join('\n');
    fs.writeFileSync(csvFilename, csvData);

    // Save the article data to the SQLite database
    const insertSql = `INSERT INTO articles (url, headline, author, date) VALUES (?, ?, ?, ?);`;
    for (const article of articleData) {
      db.run(insertSql, [article.url, article.headline, article.author, article.date]);
    }
  } catch (err) {
    console.error(err);
  }
};
// Scrape the articles and save the data
scrapeArticles();
