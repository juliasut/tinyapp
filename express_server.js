const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['Fluffy', 'thecat']
}));

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync('1111', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync('1234', 10)
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

// handles the home page
app.get("/", (req, res) => {
  req.session.user_id ? res.redirect('/urls') : res.redirect('/login');
});
  

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  users[req.session.user_id] ? res.redirect('/urls') : res.render('register', templateVars);
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  req.session.user_id ? res.redirect('/urls') : res.render('login', templateVars);
});

// renders the index page
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if(!userID) {
    return res.status(400).send(`Please <a href='/login'>login</a> or <a href='/register'>register</a> first.`);
  }
  const templateVars = { 
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase) 
  };
  res.render('urls_index', templateVars);
});

// this function needs to ALWAYS be placed before the /urls/:shortURL to be rendered correctly
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render('urls_new', templateVars);
});

// renders individual URL pages
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
   };
  res.render('urls_show', templateVars);
});

// redirects users to the long URL from the short URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// if user is not registered, add them to the database, generates random user id and hashes the password
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res.status(400).send(`Missing email or password. Please <a href='/register'> try again</a>`);
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`User with this email already exists. Please <a href='/register'>try again</a>`);
  }

  const user = {
    id,
    email,
    password
  };

  users[id] = user;
  req.session.user_id = id;
  res.redirect('/urls');
});

// checks user credentials for login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`);
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send(`Wrong password`);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

// clears the cookies on logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// handles delete URL button from the index page
app.post('/urls/:shortURL/delete', (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`);
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// edits URL form
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`);
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// handles new URL form submission
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});