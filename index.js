require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
const jwt = require("jsonwebtoken");
// TODO - require express-openid-connect and destructure auth from it
const { auth } = require('express-openid-connect');
const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
const {AUTH0_SECRET, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_BASE_URL} = process.env;
// follow the docs:
  // define the config object
  const config = {
    authRequired: true,
    auth0Logout: true,
    secret: AUTH0_SECRET,
    baseURL: AUTH0_AUDIENCE,
    clientID: AUTH0_CLIENT_ID,
    issuerBaseURL: AUTH0_BASE_URL
  }

  // attach Auth0 OIDC auth router
  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(auth(config));

  app.use(async (req, res, next) => {
    const [user] = await User.findOrCreate({
      where: {
        username: "username here",
        name: "name here",
        email: "email here"
      }
    });
    console.log(user);
    next();
  })

  // create a GET / route handler that sends back Logged in or Logged out
  app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    console.log(req.oidc.user);
    //res.send(cupcakes);
    res.setHeader("Content-type", "text/html");
    res.send(
      `<h1> My Web App, Inc. </h1>
      <h1> Welcome, ${req.oidc.user.given_name} </h1>
      <p><strong> Username: ${req.oidc.user.nickname} </strong></p>
      <p> Username: ${req.oidc.user.email} </p>
      <img src="${req.oidc.user.picture}">`
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});
