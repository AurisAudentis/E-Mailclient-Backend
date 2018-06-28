import {connect} from "mongoose";

export const connectMongo = () => connect("mongodb://localhost:27017/test")
    .then(() => console.log("Mongoose conn established."));
