import express = require("express");
import {isAuthed} from "../AuthStrategies/AuthMiddleware";

export const userRouter = express.Router();

userRouter.use(isAuthed);

userRouter.get("/:account/boxes", (req, res) => {

});
