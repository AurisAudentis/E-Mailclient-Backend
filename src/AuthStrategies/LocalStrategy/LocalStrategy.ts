import LocalStrategy = require("passport-local")    ;
import {compare} from "bcrypt";
import {userModel} from "../../Database/Models/DUser";

export const localstrategy = new LocalStrategy((email, password, done) => {
    userModel.findOne({email}, (err, user) => {
        if (err) {return done(err); }
        if (!user) {
            return done(null, false, {message: "Incorrect Username"});
        }

        compare(password, user.password, (err, res) => {
            if (res) {
                return done(null, user);
            } else if (err) {
                return done(err);
            } else {
                return done(null, false, {message: "Incorrect password"});
            }
        });
    });
});
