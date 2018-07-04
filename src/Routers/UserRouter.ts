import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";
import {accountModel, getAccount} from "../Database/Models/DAccounts";

export const userRouter = express.Router();

userRouter.use(isAuthed);

userRouter.get("/:account/boxes", (req, res) => {
    getAccount(req.user, req.params.account).then((acc) => {
        if (acc) {
            res.json(acc.boxes);
        } else {
            res.send("acc unknown");
            res.sendStatus(404);
        }
        res.end();
    });
});
