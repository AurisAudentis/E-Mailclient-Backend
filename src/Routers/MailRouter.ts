import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {IUser} from "../Database/Documents/IUser";

export const mailRouter = express.Router();

mailRouter.use(isAuthed);

mailRouter.get("/all", ((req, res) => {
    const user = req.user as IUser;
    user.getAllMail().then((x) => res.json(x));
}));

mailRouter.get("/accounts", ((req, res) => {
    const user = req.user as IUser;
    user.getDecryptedMailAccounts().then((accs) => {
        res.json(accs);
    });
}));
