import {Message} from "imap-simple";
import {Schema} from "mongoose";
import {simpleParser} from "mailparser";
import {IDTOMail} from "../../Database/Documents/IMail";

export function messageToMail(message: Message, mailbox: string, recip: string, userid: Schema.Types.ObjectId): Promise<IDTOMail> {
    const header = message.parts.find((x) => x.which === "").body;
    return simpleParser(header).then((parsedMail) => (
        { userid,
        recip,
        mailbox,
        mailid: message.attributes.uid,
        email: {
            subject: parsedMail.subject,
            date: parsedMail.headers.get("date") as Date,
            from: parsedMail.from,
            to: parsedMail.to,
            message: parsedMail.html as string || parsedMail.textAsHtml,
            flags: message.attributes.flags,
            unread: message.attributes.flags.includes(String.raw`\\UNSEEN`),
        },
    }
))
        .then(x => {console.log(x); return x});

}
