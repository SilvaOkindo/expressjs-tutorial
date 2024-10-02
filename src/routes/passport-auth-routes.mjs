import { Router } from "express";
import passport from "passport";
import "../strategy/local-strategy.mjs";

export const authRouter = Router();

authRouter.post(
  "/api/v1/auth",
  passport.authenticate("local"),
  (request, response) => {
    response.sendStatus(200);
  }
);

// logout
authRouter.post("/api/v1/auth/logout", (request, response) => {
  if(!request.user) return response.sendStatus(401)
  
  request.logout((err) => {
    if(err) return response.sendStatus(400)
    response.sendStatus(200)
  })
})

authRouter.get("/api/v1/auth/status", (request, response) => {

  console.log(request.user)
  console.log(request.session)

  return request.user
    ? response.status(200).json({ message: "Welcome to passport js" })
    : response.sendStatus(403);
});
