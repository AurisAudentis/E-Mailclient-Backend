import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {getAccount} from "../Database/Models/DAccounts";
import {IUser} from "../Database/Documents/IUser";
import * as passport from "passport";

export const userRouter = express.Router();

userRouter.use(passport.authenticate('bearer', {session: false}));
userRouter.use(isAuthed);

userRouter.get("/accounts", ((req, res) => {
    const user = req.user as IUser;
    user.getDecryptedMailAccounts().then((accs) => {
        res.json(accs);
    });
}));

userRouter.get("/", isAuthed, (req, res) => {
    console.log("not working");
    req.user.getMailAccounts().then((x) =>
        res.json({email: req.user.email, accounts: x}));
});

userRouter.get("/:account/boxes", (req, res) => {
    getAccount(req.user, req.params.account).then((acc) => {
        if (acc) {
            res.json(acc.boxes);
        } else {
            res.sendStatus(404);
            res.send("acc unknown");
        }
        res.end();
    });
});

