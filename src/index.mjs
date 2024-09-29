import express from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
import { createUserValidationSchema } from "./utils/createUserSchema.mjs";

const app = express();

app.use(express.json());

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

const users = [
  {
    id: 1,
    username: "silva",
    age: 25,
  },

  {
    id: 2,
    username: "dan",
    age: 11,
  },

  {
    id: 3,
    username: "Ethan",
    age: 22,
  },
];

app.get("/", (req, res) => {
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

    console.log(result);

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
  "/api/users", checkSchema(createUserValidationSchema),
  (request, response) => {
    const result = validationResult(request);
   

    // checkig for error

    if(!result.isEmpty()) {
        return response.status(400).json({ errors: result.array() });
    }

    const data = matchedData(request)

    console.log(data)

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

app.listen(PORT, () => {
  console.log(`Serving running on ${PORT}`);
});
