import {Message} from "imap-simple";
import {IDTOMail} from "../../Database/Documents/IMail";
import {Schema} from "mongoose";

export function messageToMail(message: Message, mailbox: string, recip: string, userid: Schema.Types.ObjectId): IDTOMail {
    const header = message.parts.filter((x) => x.which === "HEADER")[0].body;
    const body = message.parts.filter((x) => x.which === "TEXT")[0].body;
    return {
        userid,
        recip,
        mailbox,
        mailid: message.attributes.uid,
        email: {
            subject: header.subject[0],
            date: header.date[0],
            from: { name:  header.from[0], returnAddress: header["return-path"][0]},
            to: header["delivered-to"][0],
            message: body,
            flags: message.attributes.flags,
            unread: message.attributes.flags.includes(String.raw`\\UNSEEN`),
        },
    };
}
