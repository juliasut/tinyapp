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
    password: "1234"
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


app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if(!userID) {
    return res.status(400).send(`Please <a href='/login'>login</a> or <a href='/register'>register</a> first.`)
  }
  const templateVars = { 
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase) 
  };
  res.render('urls_index', templateVars);
});


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


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


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
  console.log("Added new user to the database", users[id]);
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  console.log(user);
  // console.log('password: ', typeof password, 'user.password: ', typeof user.password);
  if (!user) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`);
  }

  else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send(`Wrong password`);
  } else {

    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post('/urls/:shortURL/delete', (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`)
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send(`Invalid credentials. Please <a href='/login'>try again</a>`)
  }

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  
  console.log('shortURL', shortURL, 'longURL', urlDatabase[shortURL].longURL);
  console.log('urlDatabase', urlDatabase);
  res.redirect('/urls');
});


app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;

  console.log('shortURL:  ', shortURL, 'longURL:  ', urlDatabase[shortURL].longURL);
  console.log('urlDatabase:  ', urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});