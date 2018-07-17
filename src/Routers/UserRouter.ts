import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {accountModel, getAccount} from "../Database/Models/DAccounts";
import {IUser} from "../Database/Documents/IUser";
import {mailRouter} from "./MailRouter";

export const userRouter = express.Router();

userRouter.use(isAuthed);

mailRouter.get("/accounts", ((req, res) => {
    const user = req.user as IUser;
    user.getDecryptedMailAccounts().then((accs) => {
        res.json(accs);
    });
}));

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

