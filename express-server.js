const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  if (users[req.cookies["user_id"]]) {
    templateVars.user = users[req.cookies["user_id"]];
  }
  res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

app.get("/register", (req, res) => {
  res.render("register");
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                       longURL: urlDatabase[req.params.shortURL] };
  if (users[req.cookies["user_id"]]) {
    templateVars.user = users[req.cookies["user_id"]];
  }
  res.render("urls-show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const user = req.body;

  if (!user.username || !user.password) {
    res.status(400).send("400 error: Invalid email or password");
  }

  if (checkEmailExists(users, user.email)) {
    res.status(400).send("400 error: Email already registered")
  }

  users[randomID] = { id: randomID, email: user.username, password: user.password };
  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body["longURL"];
  res.redirect(`/urls/${randomURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let newURL = req.body.newURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  userLogin = req.body;
  userInDatabase = checkEmailExists(users, userLogin.email);

  if (!userInDatabase) {
    res.status(403).send("403 error: User with that email could not be found");
  } else {
    if (userLogin.password === userInDatabase.password) {
      res.cookie("user_id", userInDatabase);
      res.redirect("/urls");
    } else {
      res.status(403).send("403 error: Incorrect password");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substring(7);
};

function checkEmailExists(obj, email) {
  for (const userID in obj) {
    if (userID.email === email) {
      return userID;
    }
  }
  return false;
};