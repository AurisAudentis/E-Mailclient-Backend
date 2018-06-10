import {Document} from "mongoose";

export interface IDTOServer {
    type: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout: number;
}

export interface IServer extends IDTOServer, Document {
    addServer: (serv: IDTOServer) => void;
}
