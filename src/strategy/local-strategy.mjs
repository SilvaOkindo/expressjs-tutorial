import passpport from "passport";
import { Strategy } from "passport-local";
import { users } from "../mockdata/mock-users.mjs";
import { User } from "../mongose/schema/user.mjs";
import { comparePassword } from "../utils/helper.mjs";

passpport.serializeUser((user, done) => {
  done(null, user.id)
})

passpport.deserializeUser((id, done) => {
  try {

    const findUser = User.findById(id)

    if(!findUser) throw new Error("User not found")
    
    done(null, findUser)

    
  } catch (err) {
    done(err, null)
  }
})

export default passpport.use(
  new Strategy( async (username, password, done) => {
    try {
      const findUser = await User.findOne({username})
      if (!findUser) throw new Error("User not found");

      if (!comparePassword(password, findUser.password)) throw new Error("Wrong creditials");

      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);
