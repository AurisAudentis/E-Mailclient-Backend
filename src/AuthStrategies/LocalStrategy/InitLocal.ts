import {Express} from "express";
import {localstrategy} from "./LocalStrategy";
import passport= require("passport");
import {IUser} from "../../Database/Documents/IUser";
import {userModel} from "../../Database/mongoose-handler";

export function initLocalAuth(app: Express) {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(localstrategy);
    passport.serializeUser((user: IUser, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        userModel.findById(id, (err, user) => {
            done(err, user);
        });
    });
}
