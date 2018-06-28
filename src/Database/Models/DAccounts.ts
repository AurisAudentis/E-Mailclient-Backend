import {Model, model, Schema} from "mongoose";
import {IMailAccount} from "../Documents/IUser";
import {serverModel} from "./DServer";
import {decrypt, unpackIv} from "../../Imap-Simple/IMAPEncryptDecrypt";

const accountSchema: Schema = new Schema({
    userid: Schema.Types.ObjectId,
    accounts: [{email: String, password: String, server: Schema.Types.ObjectId}],
});

accountSchema.methods.getAccounts = function() {
    const accounts = this.accounts;
    return Promise.all(accounts.map((x) => {
        return serverModel.findOne({_id: x.server}).then((server) => {
            const y = Object.assign({}, x)._doc;
            y.server = server;
            return y as IMailAccount;
        });
    }));
};

accountSchema.methods.getDecryptedAccounts = function(key) {
    return this.getAccounts().then((x) => decryptAccounts(x, key));
};

export function decryptAccounts(accounts: IMailAccount[], key: string): Promise<IMailAccount[]> {
    console.log((accounts));
    return Promise.all(accounts.map((account) =>
        decrypt(unpackIv(account.password), key)
            .then((pass) => {
               account.password = pass;
               return account;
            })));
}
export const accountModel: Model<any> = model<any>("Account", accountSchema);
