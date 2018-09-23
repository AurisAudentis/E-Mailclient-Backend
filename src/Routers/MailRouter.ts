import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {emailModel} from "../Database/Models/DMail";
import * as passport from "passport";
import {IUser} from "../Database/Documents/IUser";
import {SMTPConnection} from "../Infrastructure/SMTP-Nodemailer/SMTPConnection";

export const mailRouter = express.Router();

mailRouter.use(passport.authenticate('bearer', {session: false}));
mailRouter.use(isAuthed);

mailRouter.get("/mailbox/:acc/:box/:id", (req, res) => {
    emailModel.findOne({userid: req.user._id, recip: req.params.acc, mailbox: req.params.box, mailid: req.params.id})
        .then((result) => res.send(result));
});

mailRouter.get("/mailbox/:acc/:box", (req, res) => {
    req.body.page = req.body.page - 1 || 0;
    // TODO: Make 'skip' scaleable
    emailModel.find({userid: req.user._id, recip: req.params.acc, mailbox: req.params.box})
        .sort("-email.date")
        .limit(50)
        .skip(req.body.page * 50)
        .then((result) => res.send(result));
});

mailRouter.post("/sendmail", (req, res) => {
   const user = req.user as IUser;
   user.getDecryptedSMTPMailAccounts()
       .then(accs => accs.find(acc => acc.email === req.body.email))
       .then(acc => new SMTPConnection(acc))
       .then(conn => conn.sendMail(req.body.mail))
       .then(res.send)
       .catch(err => res.status(err.status).send(err.message))
});
