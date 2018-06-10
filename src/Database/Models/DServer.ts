import {model, Model, Schema} from "mongoose";
import {IServer} from "../Documents/IServer";

const serverSchema = new Schema({
    type: String,
    host: String,
    port: Number,
    tls: Boolean,
    authTimeout: Number,
});

export const serverModel: Model<IServer> = model<IServer>("Server", serverSchema);

export function addServer(server): Promise<Schema.Types.ObjectId> {
    return serverModel.create(server).then((x) => x._id);
}
