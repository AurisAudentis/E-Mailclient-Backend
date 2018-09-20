import express = require("express");

export let mainRouter = express.Router();

mainRouter.get("/", (req, res) => {
    res.send('pong');
});
