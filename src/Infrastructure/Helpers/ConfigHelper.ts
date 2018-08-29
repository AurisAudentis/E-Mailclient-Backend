import {ImapSimpleOptions} from "imap-simple";

export function accountToConfig(account): ImapSimpleOptions {
    return {
        imap: {
           user: account.email,
           password: account.password,
            host: account.server.host,
            port: account.server.port,
            tls: account.server.tls,
            authTimeout: account.server.authTimeout,
        },
    };
}
