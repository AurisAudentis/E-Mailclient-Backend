import {Model, model, Schema} from "mongoose";
import {IDTOMail} from "../Documents/IMail";
import {IUser} from "../Documents/IUser";

const emailSchema: Schema = new Schema({
    userid: Schema.Types.ObjectId,
    mailbox: String,
    recip: String,
    mailid: Number,
    email: {
        subject: String,
        date: Date,
        from: {
            name: String,
            returnAddress: String,
        },
        to: String,
        message: String,
        unread: Boolean,
        flags: Array(String),
    },
});

export const emailModel: Model<any> = model<any>("email", emailSchema);

export function saveAllMails(mails: IDTOMail[]) {
    Promise.all(mails.map((mail) => emailModel.create(mail)));
}

export function deleteAllMails(user: IUser) {
    emailModel.deleteMany({userid: user._id}).then(console.log);
}
