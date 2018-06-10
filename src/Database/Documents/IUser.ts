import {Document} from "mongoose";
import {IDTOServer} from "./IServer";
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
}

// Model object
// The methods are implemented in DUser using model.methods.
export interface IUser extends IDTOUser, Document {
    addAccount: (account: IMailAccount) => void;
    getMailAccounts: () => Promise<IMailAccount[]>;
    getDecryptedMailAccounts: (key) => Promise<IMailAccount[]>;
    iv: string;
    createdate: Date;
}
