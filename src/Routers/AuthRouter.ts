import {IDTOUser, IUser} from "../Database/Documents/IUser";
import {userModel} from "../Database/Models/DUser";
import {uniqueEmail, validate} from "../AuthStrategies/Validate_Input";
import {deriveKey, encrypt, generateIv} from "../Imap-Simple/IMAPEncryptDecrypt";
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import passport = require("passport");
import express = require("express");
import {IMAPConnection} from "../Imap-Simple/Connection";
import {accountToConfig} from "../Helpers/ConfigHelper";
import {sync} from "../Imap-Simple/SyncService";

export const authRouter = express.Router();

authRouter.post("/register", (req, res) => {
    if (validate(req.body.email, 2, 100, ["@"])) {
        uniqueEmail(req.body.email).then((passed) => {
            if (passed) {
                const registerInfo: IDTOUser = {
                    email: req.body.email as string,
                    password: req.body.password as string,
                    accounts : [],
                };
                userModel.create(registerInfo).then(() => res.json({status: true}));
            } else {
                res.json({status: false, message: "Your email is already in use."});
            }});
    } else {
        res.json({status: false, message: "Your email is not valid."});
    }
});

authRouter.post("/login", (req, res, next) => {
    passport.authenticate("local", (errs, user: IUser) => {
        if (errs) { next(errs); }
        if (!user) { return res.sendStatus(409); }

        req.logIn(user, (fail) => {
                if (fail) { return next(fail); }
                deriveKey(req.body.password, user.iv).then((key) => {
                    if (!req.session) {
                        throw {name: "SessionError", message: "No session is found. Is Redis operational?"};
                    }
                    req.session.key = key;
                    req.session.save((err) => console.error(err));
                    return req.session.key = key;
                });
                return res.redirect("/user");
        });

        })(req, res, next);
    },
);

authRouter.get("/logout", (req, res) => {
    if (req.session) {
        req.logOut();
    }
    res.sendStatus(200);
});

authRouter.get("/", isAuthed, (req, res) => {
    req.user.getMailAccounts().then((x) =>
     res.json({email: req.user.email, accounts: x}));
});

authRouter.post("/addAccount", isAuthed, ((req, res) => {
    const user = req.user as IUser;
    const data = req.body;
    const server = data.server;
    const account = { email: data.email, password: data.password, server };

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
}));
