'use strict';

const pg = require('pg');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

const client = new pg.Client(process.env.DATABASE_URL);

client.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/test', (req, res) => res.send('hello world'));

loadDB();

function loadBooks() {
  fs.readFile('../book-list-client/data/books.json', function(err, fd) {
    JSON.parse(fd.toString()).forEach(function(ele) {
      client.query(
        'INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
      )
    })
  })
}

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    books(id SERIAL PRIMARY KEY, title VARCHAR(255), author VARCHAR(255), isbn VARCHAR(255), image_url VARCHAR(255), description TEXT NOT NULL);
    `)

    .then(loadBooks());
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});
