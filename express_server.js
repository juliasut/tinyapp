const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

// The body-parser library will convert the request body from a Buffer into string that we can read.
// It will then add the data to the req(request) object under the key body.
app.use(bodyParser.urlencoded({extended: true}));

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

// routes should be ordered from most specific to least specific
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// add another page to display a single URL and its shortened form.
// The end point for it will be in the format /urls/:shortURL.
// The : in front of id indicates that id is a route parameter.
// The value in this part of the url will be available in the req.params object.
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

function generateRandomString() {

}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});