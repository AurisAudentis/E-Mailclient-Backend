import {Document, Schema} from "mongoose";
import {AddressObject} from "mailparser";

export interface IDTOMail {
    userid: Schema.Types.ObjectId;
    mailbox: string;
    recip: string;
    mailid: number;
    email: {
        subject: string;
        date: Date;
        from: AddressObject
        to: AddressObject;
        message: string;
        unread: boolean;
        flags?: string[];
    };

}

export interface IMail extends IDTOMail, Document {

}
