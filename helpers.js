function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

function getUserByEmail(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return undefined;
}

function urlsForUser(id, database) {
  let urls = {};
  for (const url in database) {
    if (database[url].userID === id) {
      urls[url] = database[url];
    }
  }
  return urls;
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};