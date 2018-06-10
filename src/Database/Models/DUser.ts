import {model, Model, Schema} from "mongoose";
import {IMailAccount, IUser} from "../Documents/IUser";
import {hash} from "bcrypt";
import {generateIv} from "../../Imap-Simple/IMAPEncryptDecrypt";
import {accountModel, decryptAccounts} from "./DAccounts";
import {IDTOMail} from "../Documents/IMail";
import {emailModel} from "./DMail";
import {addServer} from "./DServer";

const userSchema: Schema = new Schema({
    username : String,
    email: String,
    password: String,
    auth_level: Number,
    iv: String,
    createdate: {type: Date, default: Date.now() },
})
    .pre("save", function(next) {
    console.log("hashing");
    const user = this as IUser;
    hash(user.password, 10, (err, hashed) => {
        if (err) {
            next(err);
        }
        user.password = hashed;
        next();
        });
})
    .pre("save", function(next) {
    const user = this as IUser;
    user.iv = generateIv();
    accountModel.create({userid: user._id, accounts: []});
    next();
});

userSchema.methods.addAccount = function(account: IMailAccount) {
    const user = this as IUser;
    const server = account.server;
    const acc = account as any;
    addServer(server).then((x) => {
        acc.server = x;
        return accountModel.findOne({userid : user._id});
    }).then((resolve) => {
        resolve.accounts.push(acc);
        resolve.save();
    });
};

userSchema.methods.getMailAccounts = function(): Promise<IMailAccount[]> {
    const user = this as IUser;
    return accountModel.findOne({userid: user._id}).then((x) => x.getAccounts());
};

userSchema.methods.getDecryptedMailAccounts = function(key): Promise<IMailAccount[]> {
    return this.getMailAccounts().then((x) => decryptAccounts(x, key));
};

userSchema.methods.addMail = function(mail: IDTOMail) {
    emailModel.findOne({userid: this._id}).then((resolve) => {
        resolve.emails.push(mail);
        resolve.save();
    });
};

export const userModel: Model<IUser> = model<IUser>("User", userSchema);
