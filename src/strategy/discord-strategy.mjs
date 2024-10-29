import passport from "passport";
import { Strategy } from "passport-discord";
import { DiscordUser } from "../mongose/schema/discord-user.mjs";

passport.serializeUser((user, done) => {
  console.log("inside serializer", user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try{
        const findUser = await DiscordUser.findById(id)
        console.log("Inside deserializer", findUser)

        return findUser ? done(null, findUser) : done(null, null)
    } catch(err) {
        done(err, null)
    }
})

export default passport.use(
  new Strategy(
    {
      clientID: "1300779781415243848",
      clientSecret: "yHdaDzC1blbLf05UjFCBBlG60hoJuXz7",
      callbackURL: "http://localhost:3000/api/auth/discord/redirect",
      scope: ["identify"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let findUser;

      try {
        findUser = await DiscordUser.findOne({ discordId: profile.id });
      } catch (err) {
        return done(err, null);
      }
      
      try {
        if (!findUser) {
          const newUser = new DiscordUser({
            username: profile.username,
            discordId: profile.id,
          });
          const newSavedUser = await newUser.save();
          return done(null, newSavedUser);
        }
        return done(null, findUser);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);
