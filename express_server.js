const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`)
// })

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "snake",
  },
  b6UTxS: {
    longURL: "https://www.facebook.com",
    userID: "snake",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "turtle",
  },
};

const users = {
  snake: {
    id: "snake",
    email: "snake@example.com",
    password: "snakePassword",
  },
  turtle: {
    id: "turtle",
    email: "turtle@example.com",
    password: "turtlePassword",
  },
};

//A function to retrieve URLs accociated with the current user
const urlsForUser = (id) => {
  const userURLs = {};
  const currentUser = id;
  for (const shortID of Object.keys(urlDatabase)) {
    if (urlDatabase[shortID].userID === currentUser) {
      userURLs[shortID] = urlDatabase[shortID];
    }
  } return userURLs;
};

//console.log(urlsForUser("snake"));

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).slice(2,8);
};

//a function to check whether a user's inputted email is already contained in our DB. It returns "null" if the user is in our DB, and "true" if they're not there
const checkUsers = (loginEmail) => {
  let value = true;
  for (const user of Object.keys(users)) {
    //console.log(users[user].email);
    if (users[user].email === loginEmail) {
      value = null;
    }
  } return value;
};

//a function to find the User ID, required in order to create a cookie on login
const retrieveUserID = (loginEmail) => {
  let userID = "";
  for (const user of Object.keys(users)) {
    //console.log(users[user].email);
    if (users[user].email === loginEmail) {
      userID = users[user].id;
    }
  } return userID;
};


const checkUsersPassword = (loginPassword) => {
  let value = true;
  for (const user of Object.keys(users)) {
    //console.log(users[user].email);
    if (users[user].password === loginPassword) {
      value = null;
    }
  } return value;
};

//Checks if the url ID is contained in our DB. If value = null, then the key is contained in the DB
const checkDatabaseForID = (ID) => {
  let value = true;
  for (const key in urlDatabase) {
    //console.log(users[user].email);
    if (key === ID) {
      value = null;
    }
  } return value;
};

//console.log(checkDatabaseForID("b2xVn2"));

//console.log(checkUsersPassword("snakePassword")); //--> checkUsersPassword function test code

// console.log("checkusers", checkUsers("snake@example.com")); --> checkUsers function test code

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const id = req.params.id;
  const viewerID = req.cookies["user_id"];
  if (urlDatabase[req.params.id].userID !== viewerID) {
    res.status(401).send("You don't have permission to view this URL");
  } if (urlDatabase[id] === undefined) {
    res.status(404).send("That URL ID does not exist!");
  } if (req.cookies["user_id"] === undefined) {
    res.status(401).send("You don't have permission to delete this URL");
  }
  delete urlDatabase[id];
  console.log("New database objects:",urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const viewerID = req.cookies["user_id"];
  if (urlDatabase[id].userID !== viewerID) {
    res.status(401).send("You don't have permission to view this URL");
  } if (req.cookies["user_id"] === undefined) {
    res.status(401).send("You must be logged in to view this URL");
  } if (urlDatabase[id] === undefined) {
    res.status(404).send("That URL ID does not exist!");
  }
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/register");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.status(401).send("You must be logged in to shorten a URL");
  }
  console.log('postURLs', req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.status(401).send("You must be logged in to view shortened URLs");
  }
  const userURLs = urlsForUser(req.cookies["user_id"]);
  const templateVars = {
    urls: userURLs,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (checkDatabaseForID(id) === true) {
    res.status(404).send("That URL ID does not exist!");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const viewerID = req.cookies["user_id"];
  if (urlDatabase[urlID] === undefined) {
    res.status(404).send("That URL ID does not exist!");
  } if (viewerID === undefined) {
    res.status(401).send("You must be logged in to view shortened URLs");
  } if (urlDatabase[req.params.id].userID !== viewerID) {
    res.status(401).send("You don't have permission to view this URL");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/logout", (req, res) => {
  console.log("logout requested"); // Log the POST request body to the console
  res.clearCookie('user_id', req.cookies["user_id"]);
  res.redirect(`/login`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (req.cookies["user_id"] !== undefined) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const userEmail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (userEmail === "" || password === "") {
    res.status(400).send("Please check that you've inputted a username and password!");
  } else if (checkUsers(req.body.email) === null) {
    res.status(400).send("That email already has an account registered!");
  } else {
    users[id] = {id: id, email: userEmail, password: hashedPassword};
    console.log("users:", users);
    res.cookie('user_id', users[id].id); //login new user
    res.redirect(`/urls`);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (req.cookies["user_id"] !== undefined) {
    res.redirect("/urls");
  }
  // console.log(req.cookies["user_id"]) --> how to view the value of any user id cookies on the user's browser
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  //console.log('inputtedinfo', userEmail, password); --> This line will log a user's inputted password. Very unsecure! 
  if (checkUsers(userEmail) === true) {
    res.status(403).send("User not found!");
  } if (checkUsers(userEmail) === null && bcrypt.compareSync(password, hashedPassword) === false) {
    res.status(403).send("Incorrect Password!");
  } else {
    let loginUserID = retrieveUserID(userEmail);
    res.cookie('user_id', users[loginUserID].id);
    res.redirect(`/urls`);
  }
});

app.use((req, res) => {
  res.status(404).send("404 page not found!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});