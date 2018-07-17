import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {emailModel} from "../Database/Models/DMail";

export const mailRouter = express.Router();

mailRouter.use(isAuthed);

mailRouter.get("/mailbox/:acc/:box", (req, res) => {
    req.body.page = req.body.page || 1;
    // TODO: Make 'skip' scaleable
    emailModel.find({userid: req.user._id, recip: req.params.acc, mailbox: req.params.box})
        .sort("-email.date")
        .limit(50)
        .skip(req.body.page)
        .then((result) => res.send(result));
});
