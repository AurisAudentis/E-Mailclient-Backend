import {Document} from "mongoose";

export interface IDTOMail {
    subject: string;
    mailbox: string;
    recip: string;
    mailid: number;
    date: Date;
    from: {
        name: string;
        returnAddress: string;
    };
    to: string;
    message: string;
    unread: boolean;
    flags?: string[];
}

export interface IMail extends IDTOMail, Document {

}
