const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`)
// })

app.set("view engine", "ejs");

function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2,8)
};

//console.log(generateRandomString());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const id = req.params.id
  delete urlDatabase[id];
  console.log("New database objects:",urlDatabase);
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  res.cookie('name', req.body.usernameInput)
  //console.log('req.body', req.body.usernameInput) -- to check that I'm getting the right username input
  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  //console.log('new urlDatabase values:', urlDatabase);
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["name"],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`)
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["name"]
   };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["name"]
  };
  res.render("urls_show", templateVars);
});

app.post("/logout", (req, res) => {
  console.log("logout requested"); // Log the POST request body to the console
  res.clearCookie('name', req.cookies["name"])
  res.redirect(`/urls`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});