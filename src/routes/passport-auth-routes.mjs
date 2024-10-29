import { Router } from "express";
import passport from "passport";
// import "../strategy/local-strategy.mjs";
import '../strategy/discord-strategy.mjs'

export const authRouter = Router();

authRouter.post(
  "/api/v1/auth",
  passport.authenticate("local"),
  (request, response) => {
    console.log(request.session)
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
  console.log(request.session, 'status')

  return request.user
    ? response.status(200).json({ message: "Welcome to passport js" })
    : response.sendStatus(403);
});


// passport discord OAuth

authRouter.get("/api/v1/auth/discord", passport.authenticate('discord'))
authRouter.get("/api/auth/discord/redirect", passport.authenticate('discord'), (req, res) => {
  console.log(req.session)
  console.log(req.user)
  res.sendStatus(200)
})
