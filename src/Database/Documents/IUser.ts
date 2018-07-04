import {Document} from "mongoose";
import {IDTOServer} from "./IServer";
import {IDTOMail} from "./IMail";
// Type-safe saving
export interface IDTOUser {
    email: string;
    password: string;
    auth_level?: number;
    accounts: IMailAccount[];
}

export interface IMailAccount {
    email: string;
    password: string;
    server: IDTOServer;
    boxes: string[];
}

// Model object
// The methods are implemented in DUser using model.methods.
export interface IUser extends IDTOUser, Document {
    key?: string;
    addAccount: (account: IMailAccount) => void;
    getMailAccounts: () => Promise<IMailAccount[]>;
    getDecryptedMailAccounts: () => Promise<IMailAccount[]>;
    getAllMail: () => Promise<IDTOMail[]>;
    iv: string;
    createdate: Date;
}
