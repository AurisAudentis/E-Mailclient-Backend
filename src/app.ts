import bodyParser = require("body-parser");
import express = require("express");
import logger = require("morgan");
import cors = require("cors");
import * as path from "path";
import {connectMongo} from "./Database/mongoose-handler";
import {authRouter} from "./Routers/AuthRouter";
import {mainRouter} from "./Routers/MainRouter";
import {mailRouter} from "./Routers/MailRouter";
import {userRouter} from "./Routers/UserRouter";
import config from "./config/config";
import * as passport from "passport";
import {bearerStrategy} from "./AuthStrategies/BearerStrategy/BearerStrategy";

export class App {
    public express;

    constructor() {
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: true}));
        this.express.use(logger("dev"));
        this.express.use("/static", express.static(path.join(__dirname, "/Public")));
        this.express.set("views", path.join(__dirname, "/Public"));
        this.express.set("view engine", "pug");
        this.express.use(cors({credentials: true, origin: (origin, done) => done(null, true)}));
        connectMongo();
        this.initAuth();
        this.routes();
    }

    public launch(): App {
        this.express.listen(config.port);
        console.log("Started listening to calls on port " + config.port);
        return this;
    }

    private routes(): void {
        this.express.use(`${config.mountpoint}/auth`, authRouter);
        this.express.use(`${config.mountpoint}/user`, userRouter);
        this.express.use(`${config.mountpoint}/`, mainRouter);
        this.express.use(`${config.mountpoint}/mail`, mailRouter);
    }
    private initAuth(): void {
        this.express.use(passport.initialize());
        passport.use(bearerStrategy);

    }
}
