// function to check if user is already registered
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      console.log(database[user])
      return database[user];
    }
  }
  return undefined;
}

// generates random string to be used as the shortURL and as the user's ID (learning purposes only, not for production)
const generateRandomString = () => Math.random().toString(36).substr(2, 6);

// function retrieves URLs that belong to the logged user
const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      };
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser }