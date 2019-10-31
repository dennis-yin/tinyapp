const helpers = require("./helpers")

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

for (const userID in testUsers) {
  console.log(testUsers[userID].email);
}

console.log(helpers.getUserByEmail("user@example.com", testUsers));