import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {IUser} from "../Database/Documents/IUser";
import {emailModel} from "../Database/Models/DMail";

export const mailRouter = express.Router();

mailRouter.use(isAuthed);

mailRouter.get("/accounts", ((req, res) => {
    const user = req.user as IUser;
    user.getDecryptedMailAccounts().then((accs) => {
        res.json(accs);
    });
}));

mailRouter.get("/mailbox/:acc/:box", (req, res) => {
    const paginOptions = {
        sort: {date: -1},
        page: req.body.page || 1,
        limit: 20,
    };
    emailModel.paginate({userid: req.user._id, recip: req.params.acc, mailbox: req.params.box}, paginOptions)
        .then((result) => res.send(result.docs));
});
