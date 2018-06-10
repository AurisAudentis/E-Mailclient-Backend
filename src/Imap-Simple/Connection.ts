import im_simple = require("imap-simple");
import {ImapSimple, ImapSimpleOptions} from "imap-simple";
import {seqPromiseResolver} from "./Helpers/PromiseHelper";
import {messageToMail} from "./Helpers/MessageConverter";
import {IDTOMail} from "../Database/Documents/IMail";

export class IMAPConnection {
    private config: ImapSimpleOptions;

    constructor(config: ImapSimpleOptions) {
        this.config = config;
    }

    public getAllMails(): Promise< IDTOMail[] > {
        return this.getConnection().then((conn) => {
            // getboxes is added in latest version of imapsimple, type file not up to date.
            return conn.getBoxes().then((boxes) => {
                boxes = Object.keys(boxes);
                // We map the boxes to a Promise that returns the e-mails;
                const factories = boxes.map((x) => () => conn.openBox(x)
                    .then(() => this.getMailsFromOpenMailbox(conn, x)));
                // We resolve the promises sequentially: No two boxes can be open at the same time.
                return seqPromiseResolver<IDTOMail>(factories).then((x) => {conn.end(); return x; });
            });
        });
    }

    // Returns all the emails in the currently open mailbox in IDTOMail format.
    private getMailsFromOpenMailbox(conn: ImapSimple, box: string): Promise<IDTOMail[]> {
        const searchCriteria = ["ALL"];
        const searchOptions = {bodies: ["HEADER", "TEXT"], markSeen: false};
        // Map results to IDTOMail format.
        return conn.search(searchCriteria, searchOptions).then((results) =>
            results.map((x) => messageToMail(x, box, this.config.imap.user)));
    }

    private getConnection(): Promise < ImapSimple > {
        return im_simple.connect(this.config);
    }
}

const configTest: ImapSimpleOptions = {
    imap: {
        user: "maxiem@maxiemgeldhof.com",
        password: "e8e85cmc",
        host: "maxiemgeldhof.com",
        port: 993,
        tls: true,
        authTimeout: 3000,
    },
};

new IMAPConnection(configTest).getAllMails().then(console.log);
