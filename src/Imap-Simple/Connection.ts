import im_simple = require("imap-simple");
import {ImapSimple, ImapSimpleOptions} from "imap-simple";
import {seqPromiseResolver} from "../Helpers/PromiseHelper";
import {messageToMail} from "../Helpers/MessageConverter";
import {IDTOMail} from "../Database/Documents/IMail";
import {IUser} from "../Database/Documents/IUser";

export class IMAPConnection {
    private config: ImapSimpleOptions;
    private user: IUser;
    private conn: ImapSimple;

    constructor(config: ImapSimpleOptions, user: IUser) {
        this.config = config;
        this.user = user;
        this.conn = null;
    }

    public getAllMails(): Promise< IDTOMail[] > {
        return this.start().then(() => {
            // getboxes is added in latest version of imapsimple, type file not up to date.
            return this.conn.getBoxes().then((boxes) => {
                boxes = Object.keys(boxes);
                // We map the boxes to a Promise that returns the e-mails;
                const factories = boxes.map((x) => () => this.conn.openBox(x)
                    .then(() => this.getMailsFromOpenMailbox(this.conn, x)));
                // We resolve the promises sequentially: No two boxes can be open at the same time.
                return seqPromiseResolver<IDTOMail>(factories).then((x) => {this.end(); return x; });
            });
        });
    }

    public test(): Promise<boolean> {
        console.log("Testing");
        return this.start()
            .then((x) => {this.end(); console.log("yes"); return true; })
            .catch((x) => {console.log(x); return false; });
    }

    // Returns all the emails in the currently open mailbox in IDTOMail format.
    private getMailsFromOpenMailbox(conn: ImapSimple, box: string): Promise<IDTOMail[]> {
        const searchCriteria = ["ALL"];
        const searchOptions = {bodies: ["HEADER", "TEXT"], markSeen: false};
        // Map results to IDTOMail format.
        return conn.search(searchCriteria, searchOptions).then((results) =>
            results.map((x) => messageToMail(x, box, this.config.imap.user, this.user._id)));
    }

    private start(): Promise<void> {
        return im_simple.connect(this.config).then((x) => { this.conn = x; });
    }

    private end() {
        this.conn.end();
        this.conn = null;
    }
}
