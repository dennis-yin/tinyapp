function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

function checkEmailExists(database, email) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return false;
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

module.exports = { generateRandomString, checkEmailExists, urlsForUser };