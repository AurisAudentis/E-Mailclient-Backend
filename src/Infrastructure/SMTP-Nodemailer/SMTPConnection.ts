import {IMailAccount} from "../../Database/Documents/IUser";
import {createTransport, SentMessageInfo} from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";

export class SMTPConnection {
    private transport: Mail;
    private mailAcc: IMailAccount;

    constructor(mailAcc: IMailAccount) {
        if (!mailAcc) {throw {status: 401, message:"Your account is not found"}}
        this.transport = createTransport({secure: false, host: mailAcc.server.host, port: mailAcc.server.port, auth: {user: mailAcc.email, pass: mailAcc.password}});
        this.mailAcc = mailAcc;
    }

    test(): Promise<boolean> {
        return this.transport.verify();
    }

    sendMail(mail: Mail.Options): Promise<SentMessageInfo> {
        mail.from = this.mailAcc.email;
        return this.transport.sendMail(mail);
    }
    
}