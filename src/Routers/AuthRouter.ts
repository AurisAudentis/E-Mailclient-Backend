import {IDTOUser, IMailAccount, IUser} from "../Database/Documents/IUser";
import {userModel, serverModel} from "../Database/mongoose-handler";
import passport = require("passport");
import {uniqueEmail, validate} from "../AuthStrategies/Validate_Input";
import express = require("express");
import {deriveKey} from "../Imap-Simple/IMAPEncryptDecrypt";
import {isAuthed} from "../AuthStrategies/AuthMiddleware";

export let authRouter = express.Router();

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
    passport.authenticate("local", (err, user: IUser) => {
            if (err) { next(err); }
            if (!user) { return res.sendStatus(409); }
            req.logIn(user, (fail) => {
                if (fail) { return next(fail); }
                req.session.key = deriveKey(req.body.password, user.iv);
                return res.json({email: user.email});
        });
        })(req, res, next);
    },
);

authRouter.get("/logout", (req, res) => {
    if (req.session) {
        req.logOut();
        req.session.destroy((err) => { throw err; });
    }
    res.sendStatus(200);
});

authRouter.get("/user", isAuthed, (req, res) => {
    res.json({ email: req.user.email, accounts: req.user.accounts });
});

authRouter.get("/user/addAccount", isAuthed, ((req, res) => {
    const data = req.body.account;
    const account = { email: data.email, password: "", server: "" };
    const server = { type: data.type, host: data.address, port: data.port, tls: data.tls, authTimeout: 3000};

}));
