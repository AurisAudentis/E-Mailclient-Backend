import {IUser} from "../Database/Documents/IUser";
import {deriveKey, encrypt, generateIv} from "../Infrastructure/Imap-Simple/IMAPEncryptDecrypt";
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {IMAPConnection} from "../Infrastructure/Imap-Simple/IMAPConnection";
import {accountToConfig} from "../Infrastructure/Helpers/ConfigHelper";
import {sync} from "../Infrastructure/Imap-Simple/SyncService";
import config from "../config/config";
import {userModel} from "../Database/Models/DUser";
import {validateResponse} from "../Infrastructure/Helpers/ValidateResponse";
import express = require("express");
import needle = require("needle");

export const authRouter = express.Router();

authRouter.post("/register", (req, res) => {
    needle('post', `${config.oauthUrl}/user/register`, {...config.oauth_credentials, email: req.body.username, password: req.body.password})
        .then(response => validateResponse(response))
        .then((response) => userModel.create({email: req.body.username, password: "", uid: response.body.uid, accounts: []}))
        .then(() => res.send({message: "success"}))
        .catch((err) => {err.status = err.status || 400; res.status(err.status).json(err).end()})
});

authRouter.post("/login", (req, res) => {
    userModel.findOne({email: req.body.username})
        .then(user => Promise.all([
            needle('post', `${config.oauthUrl}/token`, {...config.oauth_credentials, uid: user.uid, password: req.body.password, grant_type:"password"}),
            deriveKey(req.body.password, user.iv)
        ]))
        .then(results => {
            validateResponse(results[0]); return results})
        .then(results => res.send({...results[0].body, key: results[1]}))
        .catch(err => {err.status = err.status || 401;
        res.status(err.status).send(err).end()})
});

authRouter.post("/refreshtoken", (req, res) => {
    res.status(401).send({err: "not implemented"});
});
