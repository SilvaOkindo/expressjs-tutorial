import passpport from "passport";
import { Strategy } from "passport-local";
import { users } from "../mockdata/mock-users.mjs";

passpport.serializeUser((user, done) => {
  done(null, user.id)
})

passpport.deserializeUser((id, done) => {
  try {

    const findUser = users.find(user => user.id === id)

    if(!findUser) throw new Error("User not found")
    
    done(null, findUser)

    
  } catch (err) {
    done(err, null)
  }
})

export default passpport.use(
  new Strategy((username, password, done) => {
    console.log("inside local strategy: " + username)
    try {
      const findUser = users.find((user) => user.username === username);
      if (!findUser) throw new Error("User not found");

      if (findUser.password !== password) throw new Error("Wrong creditials");

      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);
