import im_simple = require("imap-simple");
import {ImapSimple, ImapSimpleOptions} from "imap-simple";
import {seqPromiseResolver} from "../Helpers/PromiseHelper";
import {messageToMail} from "../Helpers/MessageConverter";
import {IDTOMail, IMail} from "../Database/Documents/IMail";
import {IUser} from "../Database/Documents/IUser";
import {ImapMessageAttributes} from "imap";

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
                return seqPromiseResolver<IDTOMail>(factories)
                    .then(this.end.bind(this));
            });
        });
    }

    public test(): Promise<boolean> {
        return this.start()
            .then((x) => true)
            .then(this.end.bind(this))
            .catch((x) => false);
    }

    public headersAndFlags(box): Promise<ImapMessageAttributes[]> {
        return this.start()
            .then(() => this.conn.openBox(box))
            .then(() => this.conn.search(["ALL"], {bodies: ["HEADER"], markSeen: false}))
            .then(this.end.bind(this))
            .then((headers) => headers.map((x) => x.attributes));
    }

    public getMailsByUID(box: string, uids: number[]): Promise<IDTOMail[]> {
        return this.start()
            .then(() => this.conn.openBox(box))
            .then(() =>
                Promise.all(uids.map((uid) => this.conn.search([["UID", uid]], {bodies: ["HEADER", "TEXT"]}))))
            .then((messages) =>
                messages.map((message) => messageToMail(message[0], box, this.user.email, this.user._id)),
            )
            .then((messages) => messages.reduce((acc, curr) => {acc.push(curr); return acc; }, []))
            .then(this.end.bind(this));
    }

    public getBoxes(): Promise<string[]> {
        return this.start()
            .then(() => this.conn.getBoxes())
            .then((box) => Object.keys(box))
            .then((boxes) => {console.log(boxes); return boxes; })
            .then(this.end.bind(this));
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

    private end(x) {
        this.conn.end();
        this.conn = null;
        return x;
    }
}
