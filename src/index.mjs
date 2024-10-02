import express from "express";
import cookieParse from "cookie-parser";
import session from "express-session";
import passport from "passport"
import {
  query,
  validationResult,
  matchedData,
  checkSchema,
} from "express-validator";
import { createUserValidationSchema } from "./utils/createUserSchema.mjs";

import { productRoutes } from "./routes/productRoutes.mjs";
import { users } from "./mockdata/mock-users.mjs";
import { authRouter } from "./routes/passport-auth-routes.mjs";
// import "./strategy/local-strategy.mjs"

const app = express();

app.use(express.json());
app.use(cookieParse("helloworld"));
app.use(
  session({
    secret: "session-secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);

app.use(passport.initialize())
app.use(passport.session())

// auth routes
app.use(authRouter)

// product routes
app.use(productRoutes);

// middleware

const resolverUserById = (request, response, next) => {
  const {
    params: { id },
  } = request;
  const parsedId = parseInt(id);

  if (isNaN(parsedId))
    return response.status(400).send({ message: "Bad request" });

  const findUserIndex = users.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1)
    return response.status(404).send({ message: "User not foiund" });

  request.findUserIndex = findUserIndex;

  next();
};

const PORT = 3000;



app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited = true;

  res.cookie("hello", "world", { maxAge: 60000 * 60 * 2, signed: true });

  res.send({ message: "Hello world" });
});

// get all users
app.get(
  "/api/users",
  query("filter")
    .isString()
    .notEmpty()
    .withMessage("Must not be empty")
    .isLength({ min: 3, max: 10 })
    .withMessage("Must be at least 3-10 characters"),

  (req, res) => {
    const result = validationResult(req);

    // sessions checking
    console.log("Session id in users/api: " + req.sessionID);

    req.sessionStore.get(req.session.id, (err, sessionData) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(sessionData);
    });

    const {
      query: { filter, value },
    } = req;

    if (filter && value) {
      return res.send(users.filter((user) => user[filter].includes(value)));
    }

    return res.send(users);
  }
);

// get 1 user
// params returns an object
app.get("/api/users/:id", resolverUserById, (request, response) => {
  const findUser = users[request.findUserIndex];

  if (!findUser)
    return response
      .status(404)
      .send({ message: "Bad request. User not found" });

  response.send(findUser);
});

// adding user
app.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  (request, response) => {
    const result = validationResult(request);

    // checkig for error

    if (!result.isEmpty()) {
      return response.status(400).json({ errors: result.array() });
    }

    const data = matchedData(request);

    console.log(data);

    const newUSer = { id: users[users.length - 1].id + 1, ...data };
    //console.log(newUSer)
    users.push(newUSer);
    return response.status(201).json({ message: "user added successfully" });
  }
);

// updating a user
app.put("/api/users/:id", resolverUserById, (request, response) => {
  const { body, findUserIndex } = request;

  users[findUserIndex] = { id: users[findUserIndex].id, ...body };

  return response.status(200).json({ message: "User updated" });
});

// editing a user
app.patch("/api/users/:id", resolverUserById, (request, response) => {
  const { body, findUserIndex } = request;

  users[findUserIndex] = { ...users[findUserIndex], ...body };

  return response.status(200).json({ message: "User updated" });
});

// delete user
app.delete("/api/users/:id", resolverUserById, (request, response) => {
  const { findUserIndex } = request;

  return response.status(200).send(users.splice(findUserIndex, 1));
});

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
    if(err) {
      console.log(err)
    }
    console.log(sessionData)
  })

  return request.session.user
    ? response.status(200).json(request.session.user)
    : response.status(401).send({ message: "Not authenticated" });
});


// cart

app.post("/api/cart", (request, response) => {
  if(!request.session.user) return response.sendStatus(401)
  
  const {body: item} = request
  const {cart} = request.session

  if(cart) {
    cart.push(item)
  } else {
    request.session.cart = [item]
  }



  return response.status(201).send(item)


})


app.get("/api/cart", (request, response) => {
  if(!request.session.user) return response.statusCode(401)
  
  return response.status(200).send(request.session.cart ?? [])
})


app.listen(PORT, () => {
  console.log(`Serving running on ${PORT}`);
});
