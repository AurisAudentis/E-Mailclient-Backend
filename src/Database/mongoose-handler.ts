import {connect} from "mongoose";
import config from "../config/config";

export const connectMongo = () => connect(config.databaseUrl)
    .then(() => console.log("Mongoose conn established."));
