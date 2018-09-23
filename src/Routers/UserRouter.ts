import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {getAccount} from "../Database/Models/DAccounts";
import {IUser} from "../Database/Documents/IUser";
import * as passport from "passport";
import {IMAPConnection} from "../Infrastructure/Imap-Simple/IMAPConnection";
import {accountToConfig} from "../Infrastructure/Helpers/ConfigHelper";
import {encrypt, generateIv} from "../Infrastructure/Imap-Simple/IMAPEncryptDecrypt";
import {sync} from "../Infrastructure/Imap-Simple/SyncService";

export const userRouter = express.Router();

userRouter.use(passport.authenticate('bearer', {session: false}));
userRouter.use(isAuthed);

userRouter.get("/accounts", ((req, res) => {
    const user = req.user as IUser;
    user.getDecryptedIMAPMailAccounts().then((accs) => {
        res.json(accs);
    });
}));

userRouter.post("/addAccount", (req, res) => {
    const user = req.user as IUser;
    const data = req.body;
    const server = data.server;
    const account = {email: data.email, password: data.password, server};

    new IMAPConnection(accountToConfig(account), user).test()
        .then((succeeded) => {
            if (succeeded) {
                encrypt(data.password, user.key, generateIv())
                    .then((pass) => {
                        account.password = pass;
                        user.addAccount(account);
                        sync(user);
                        res.status(200);
                        res.end();
                    });
            } else {
                res.status(400);
            }
        });
});

userRouter.get("/", isAuthed, (req, res) => {
    // @ts-ignore
    sync(req.user);
    req.user.getDecryptedIMAPMailAccounts()
        .then(x => x.map(acc => ({...acc, password: undefined})))
        .then((x) =>
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

