const express = require('express');
const app = express();
const morgan = require('morgan')
const PORT = 8000;

// The body-parser library will convert the request body from a Buffer into string that we can read.
// It will then add the data to the req(request) object under the key body.
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

// set embedded js template to view engine
app.set('view engine', 'ejs');

// set db to store full and shortened urls 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n')
// });

// we pass templateVars obj to the template 'urls_index' in views for ejs to render
// ejs looks for views folder by default. No need for file extention, just name
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// routes should be ordered from most specific to least specific
// res.render() is a route handler to pass URL data to our template
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

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST request has a body, while a GET request does not. To read the buffer = we need a parser express.urlencoded
// will convert body into a string and add key body to req object
app.post('/urls', (req, res) => {
  let shortURL = Math.random().toString(36).substring(7);
  
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);
  res.redirect('/urls/:shortURL');
});



app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});