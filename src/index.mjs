import express from "express";
import cookieParse from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";


import { productRoutes } from "./routes/productRoutes.mjs";
import { users } from "./mockdata/mock-users.mjs";
import { authRouter } from "./routes/passport-auth-routes.mjs";
import { userRouter } from "./routes/userRoutes.mjs";
// import "./strategy/local-strategy.mjs"

const app = express();

// connect to db

mongoose
  .connect("mongodb://localhost/expressjs_tutorial")
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cookieParse("helloworld"));
app.use(
  session({
    secret: "session-secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient()
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

 // user routes
 app.use(userRouter)

// auth routes
app.use(authRouter);

// product routes
app.use(productRoutes);

// middleware



const PORT = 3003;

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited = true;

  res.cookie("hello", "world", { maxAge: 60000 * 60 * 2, signed: true });

  res.send({ message: "Hello world" });
});

// get all users


// api/auth

app.post("/api/auth", (request, response) => {
  const { username, password } = request.body;

  const findUser = users.find((user) => user.username === username);

  if (!findUser || findUser.password !== password) {
    return response.status(401).send({ message: "BAD CREDINTIALS" });
  }

  request.session.user = findUser;

  return response.status(200).json({ message: `Welcome ${findUser.username}` });
});

app.get("/api/auth/status", (request, response) => {
  // log the session data

  request.sessionStore.get(request.session.id, (err, sessionData) => {
    if (err) {
      console.log(err);
    }
    console.log(sessionData);
  });

  return request.session.user
    ? response.status(200).json(request.session.user)
    : response.status(401).send({ message: "Not authenticated" });
});

// cart

app.post("/api/cart", (request, response) => {
  if (!request.session.user) return response.sendStatus(401);

  const { body: item } = request;
  const { cart } = request.session;

  if (cart) {
    cart.push(item);
  } else {
    request.session.cart = [item];
  }

  return response.status(201).send(item);
});

app.get("/api/cart", (request, response) => {
  if (!request.session.user) return response.sendStatus(401);

  return response.status(200).send(request.session.cart ?? []);
});

app.listen(PORT, () => {
  console.log(`Serving running on ${PORT}`);
});
