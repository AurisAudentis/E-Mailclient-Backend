import {connect} from "mongoose";

export const connectMongo = () => connect("mongodb://maxiemgeldhof.com:27017/mail")
    .then(() => console.log("Mongoose conn established."));
