import {IMAPConnection} from "./Connection";
import {IMailAccount, IUser} from "../Database/Documents/IUser";
import {accountToConfig} from "../Helpers/ConfigHelper";
import {emailModel, saveAllMails} from "../Database/Models/DMail";
import {seqPromiseResolver} from "../Helpers/PromiseHelper";

// We resolve all promises sequentially to insure that the system doesn't get overloaded
// and to prevent too many connections to be simultaneously started.
export function sync(user: IUser) {
    user.getDecryptedMailAccounts()
        .then((accounts) => {
            const factories = accounts.map((account) => () => syncAccount(user, account));
            console.log("sync");
            seqPromiseResolver(factories);
        });
}

export function syncAccount(user: IUser, account: IMailAccount): Promise<void[]> {
    const conn = new IMAPConnection(accountToConfig(account), user);
    console.log("sync acc");
    return conn.getBoxes().then(
        (boxes) => {
            const factories = boxes.map((box) => () => syncBox(user, conn, box));
            return seqPromiseResolver<void>(factories);
        });
}

export function syncBox(user: IUser, conn: IMAPConnection, box: string): Promise<void> {
    console.log("sync box");
    return Promise.all([conn.headersAndFlags(box), emailModel.find({userid: user._id, mailbox: box})])
        .then((emails) => {
            // Mapping uid to mail for correspondence between objects.
            const imapmails = {};
            emails[0].forEach((mail) => imapmails[mail.uid] = mail);
            const dbmails = {};
            emails[1].forEach((mail) => dbmails[mail.mailid] = mail);

            const toSave = [];
            const dbUIDSet = new Set(Object.keys(dbmails));
            for (let uid in imapmails) {
                if (uid in dbmails) {
                    if (JSON.stringify(imapmails[uid].flags.sort()) !==
                                JSON.stringify(dbmails[uid].email.flags.sort())) {
                        console.log(dbmails[uid].email.flags, imapmails[uid].flags);
                        dbmails[uid].flags = imapmails[uid].flags;
                        dbmails[uid].save();
                    }
                    dbUIDSet.delete(uid);
                } else {
                    toSave.push(uid);
                }
            }

            return conn.getMailsByUID(box, toSave.map((x) => Number(x)))
                .then((mails) => saveAllMails(mails));

            // TODO: add delete function for uids in db no longer on IMAP server.
        });
}