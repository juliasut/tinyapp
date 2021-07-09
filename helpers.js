
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
}

const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const urlsForUser = (id) => {
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