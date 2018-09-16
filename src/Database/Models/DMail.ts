import {Model, model, PaginateModel, Schema} from "mongoose";
import {IDTOMail} from "../Documents/IMail";
import {IUser} from "../Documents/IUser";
import paginate = require("mongoose-paginate");

const AddressObject = {html: String, text: String, value: Array({address: String, name: String})};

const emailSchema: Schema = new Schema({
    userid: Schema.Types.ObjectId,
    mailbox: String,
    recip: String,
    mailid: Number,
    email: {
        subject: String,
        date: Date,
        from: {...AddressObject},
        to: {...AddressObject},
        message: String,
        unread: Boolean,
        flags: Array(String),
    },
});

emailSchema.plugin(paginate);

export const emailModel: PaginateModel<any> = model<any>("email", emailSchema);

export function saveAllMails(mails: IDTOMail[]) {
    Promise.all(mails.map((mail) => emailModel.create(mail)));
}

export function deleteAllMails(user: IUser) {
    emailModel.deleteMany({userid: user._id})
}
