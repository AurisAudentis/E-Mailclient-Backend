import bodyParser = require("body-parser");
import connRedis = require("connect-redis");
import express = require("express");
import session = require("express-session");
import logger = require("morgan");
import * as path from "path";
import {initLocalAuth} from "./AuthStrategies/LocalStrategy/InitLocal";
import {connectMongo} from "./Database/mongoose-handler";
import {authRouter} from "./Routers/AuthRouter";
import {mainRouter} from "./Routers/MainRouter";
import cors = require("cors");

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
        this.express.use(cors({credentials: true, origin: "http://localhost:4200"}));
        connectMongo();
        this.initSession();
        this.routes();
    }

    public launch(): App {
        this.express.listen(8080);
        return this;
    }

    private routes(): void {
        this.express.use("/", authRouter);
        this.express.use("/", mainRouter);
    }
    private initSession(): void {
        const RedisStore = connRedis(session);
        this.express.use(session({
            store: new RedisStore({host: "localhost", port: 6379}),
            secret: "light of the way",
            resave: false,
            saveUninitialized: false,
            },
        ));
        initLocalAuth(this.express);
    }

}
