import {Express} from "express";
import {localstrategy} from "./LocalStrategy";
import passport= require("passport");
import {IUser} from "../../Database/Documents/IUser";
import {userModel} from "../../Database/Models/DUser";
import {bearerStrategy} from "../BearerStrategy/BearerStrategy";

export function initLocalAuth(app: Express) {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(bearerStrategy);
}
