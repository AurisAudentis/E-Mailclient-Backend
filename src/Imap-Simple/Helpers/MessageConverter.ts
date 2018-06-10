import {Message} from "imap-simple";
import {IDTOMail} from "../../Database/Documents/IMail";
//
export function messageToMail(message: Message, mailbox: string, recip: string): IDTOMail {
    const header = message.parts.filter((x) => x.which === "HEADER")[0].body;
    const body = message.parts.filter((x) => x.which === "TEXT")[0].body;
    return {
        flags: message.attributes.flags,
        mailid: message.attributes.uid,
        subject: header.subject[0],
        date: header.date[0],
        from: { name:  header.from[0], returnAddress: header["return-path"][0]},
        to: header["delivered-to"][0],
        message: body,
        unread: message.attributes.flags.includes("\\\\UNSEEN"),
        recip,
        mailbox,
    };
}
