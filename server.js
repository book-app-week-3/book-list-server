'use strict';

// ++++++++++++++++++++++++
//Application dependencies
// ++++++++++++++++++++++++
const pg = require('pg');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// ++++++++++++++++++++++++
//Application setup
// ++++++++++++++++++++++++
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// ++++++++++++++++++++++++
//Database setup
// ++++++++++++++++++++++++
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// ++++++++++++++++++++++++
//Application middleware
// ++++++++++++++++++++++++
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// ++++++++++++++++++++++++
//API endpoints
// ++++++++++++++++++++++++
app.get('/test', (req, res) => res.send('hello world'));
app.get('/api/v1/books', (req, res) => {
  client.query(
    `SELECT book_id, title, author, image_url, isbn
    FROM books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});
app.get('*', (req, res) => res.redirect(CLIENT_URL));

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
