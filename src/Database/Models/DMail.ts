import {Model, model, Schema} from "mongoose";

const emailSchema: Schema = new Schema({
    userid: Schema.Types.ObjectId,
    mailbox: String,
    recip: String,
    mailid: Number,
    emails: [{
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
    }],
});

export const emailModel: Model<any> = model<any>("email", emailSchema);
