import { Router } from "express";
import {
  query,
  validationResult,
  matchedData,
  checkSchema,
} from "express-validator";

import { createUserValidationSchema } from "../utils/createUserSchema.mjs";
import { users } from "../mockdata/mock-users.mjs";
import { User } from "../mongose/schema/user.mjs";
import { hashPasswords } from "../utils/helper.mjs";

export const userRouter = Router();

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

userRouter.get(
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
userRouter.get("/api/users/:id", resolverUserById, (request, response) => {
  const findUser = users[request.findUserIndex];

  if (!findUser)
    return response
      .status(404)
      .send({ message: "Bad request. User not found" });

  response.send(findUser);
});

// adding user
userRouter.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  async (request, response) => {
    const result = validationResult(request);

    // checking for error

    if (!result.isEmpty()) {
      return response.status(400).json({ errors: result.array() });
    }

    try {

        const data = matchedData(request);

        console.log(data);

        // hashing password
        data.password = hashPasswords(data.password)
    
        const newUSer = await User(data)

        const savedUser = newUSer.save()
        //console.log(newUSer)
        
        return response.status(201).json({ message: "user added successfully" });

    } catch(err) {
        console.log(err)
        return response.sendStatus(400)
    }

  }
);

// updating a user
userRouter.put("/api/users/:id", resolverUserById, (request, response) => {
  const { body, findUserIndex } = request;

  users[findUserIndex] = { id: users[findUserIndex].id, ...body };

  return response.status(200).json({ message: "User updated" });
});

// editing a user
userRouter.patch("/api/users/:id", resolverUserById, (request, response) => {
  const { body, findUserIndex } = request;

  users[findUserIndex] = { ...users[findUserIndex], ...body };

  return response.status(200).json({ message: "User updated" });
});

// delete user
userRouter.delete("/api/users/:id", resolverUserById, (request, response) => {
  const { findUserIndex } = request;

  return response.status(200).send(users.splice(findUserIndex, 1));
});
