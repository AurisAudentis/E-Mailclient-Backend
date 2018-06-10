import {connect} from "mongoose";
export {userModel} from "./Models/DUser";
export {serverModel} from "./Models/DServer";
export {emailModel} from "./Models/DMail";

export const connectMongo = () => connect("mongodb://localhost:27017/test")
    .then(() => console.log("Mongoose conn established."));
