const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const helpers = require("./helpers");

const urlDatabase = {};
const users = {};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res.send("Please login first");
  }
  const temp = helpers.urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { urls: temp };
  if (users[req.session.user_id]) {
    templateVars.user = users[req.session.user_id];
  }
  res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] }
    res.render("urls-new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urls = helpers.urlsForUser(req.session.user_id, urlDatabase);

  if (!(Object.keys(urls).includes(shortURL))) {
    res.status(300).send("This URL does not belong to you");
  }

  let templateVars = { longURL: urlDatabase[shortURL].longURL, shortURL: shortURL };
  if (users[req.session.user_id]) {
    templateVars.user = users[req.session.user_id];
  }
  res.render("urls-show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (shortURL) {
    res.redirect(shortURL.longURL);
  } else {
    res.status(300).send("This URL does not exist");
  }
});

app.post("/register", (req, res) => {
  const randomID = helpers.generateRandomString();
  const user = req.body;

  if (!(user.email || user.password)) {
    res.status(400).send("400 error: Invalid email or password");
  }

  if (helpers.getUserByEmail(user.email, users)) {
    res.status(400).send("400 error: Email already registered");
  }

  const hashedPassword = bcrypt.hashSync(user.password, 10);
  users[randomID] = { id: randomID, email: user.email, password: hashedPassword };
  req.session.user_id = randomID;   // was res... before; why does this work now
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const randomURL = helpers.generateRandomString();
  urlDatabase[randomURL] = { longURL: req.body["longURL"], userID: req.session.user_id };
  res.redirect(`/urls/${randomURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(300).send("That URL does not belong to you");
    }
  } else {
    res.status(300).send("Please login before deleting URLs");
  }
});

// Edit the long URL that relates to a short URL
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id] === urlDatabase[req.params.shortURL].userID) {
    const newURL = req.body.newURL;
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    urlDatabase[shortURL] = { newURL, userID };
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const userLogin = req.body;
  const userInDatabase = users[helpers.getUserByEmail(userLogin.email, users)];

  if (!userInDatabase) {
    res.status(403).send("403 error: User with that email could not be found");
  } else {
    if (bcrypt.compareSync(userLogin.password, userInDatabase.password)) {
      req.session.user_id = userInDatabase.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("403 error: Incorrect password");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
