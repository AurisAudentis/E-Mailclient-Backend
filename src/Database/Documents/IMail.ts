import {Document, Schema} from "mongoose";

export interface IDTOMail {
    userid: Schema.Types.ObjectId;
    mailbox: string;
    recip: string;
    mailid: number;
    email: {
        subject: string;
        date: Date;
        from: {
            name: string;
            returnAddress: string;
        };
        to: string;
        message: string;
        unread: boolean;
        flags?: string[];
    };

}

export interface IMail extends IDTOMail, Document {

}
