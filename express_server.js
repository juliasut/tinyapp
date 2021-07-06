const express = require('express');
const app = express();
const PORT = 8080;

// set embedded js template to view engine
app.set('view engine', 'ejs');

// set db to store full and shortened urls 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
});

// we pass templateVars obj to the template 'urls_index' in views for ejs to render
// ejs looks for views folder by default. No need for file extention, just name
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});