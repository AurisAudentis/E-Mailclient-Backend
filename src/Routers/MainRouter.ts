import express = require("express");
import {IUser} from "../Database/Documents/IUser";

export let mainRouter = express.Router();

mainRouter.get("/", (req, res) => {
    if ( !req.session.counter) {
        req.session.counter = 0;
    }
    req.session.counter += 1;
    let message = "You've visited this page " + req.session.counter + "times.\n";
    if (req.isAuthenticated()) {
        const user = req.user as IUser;
        message += "You are also logged in: welcome to " + user.email;
    }
    res.send(message);
});
