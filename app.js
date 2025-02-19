const express = require('express');
const hbs = require('hbs');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    message: 'Welcome to my HBS app!'
  });
});

app.get('/event', (req, res) => {
  res.render('event', {
    title: 'Event',
    description: 'This page provides details about the event.'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
