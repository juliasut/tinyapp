const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { get } = require('http');
const PORT = 1235;

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1111"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => Math.random().toString(36).substr(2, 6);
const getUserByEmail = function(email) {
  const values = Object.values(users);
  for (const user of values) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[res.cookie.user_id]
  }
  console.log('req.cookies', req.cookies);
  res.render('register', templateVars);
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  }
  // console.log(templateVars)
  // console.log(res.cookies.user_id)
  res.render('login', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    user: users[req.cookies.user_id],
    urls: urlDatabase 
  };
  console.log(templateVars)
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[res.cookie.user_id]
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[res.cookie.user_id]
   };
  console.log("shortURL", req.params.shortURL);
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post('/register', (req, res) => {
  const email = req.body.password;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`Missing email or password. Please <a href='/register'> try again</a>`);
  }

  if (getUserByEmail(email)) {
    return res.status(400).send(`User with this email already exists. Please <a href='/register'>try again</a>`);
  }
  const id = generateRandomString();
  const user = {
    id,
    email,
    password
  };
  users[id] = user;
  res.cookie('user_id', user.id)
  res.redirect('/urls');
  
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user || password !== user.password) {
    return res.status(400).send(`Invalid credentials. Please <a href='/login'>try again</a>`);
  }

  res.cookie('user_id', user.id);
  console.log(req.cookies)
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});