import {userModel} from "./Database/Models/DUser";
import {deriveKey, encrypt, generateIv} from "./Infrastructure/Imap-Simple/IMAPEncryptDecrypt";
import {connectMongo} from "./Database/mongoose-handler";
import {IDTOMail} from "./Database/Documents/IMail";
import {IMAPConnection} from "./Infrastructure/Imap-Simple/IMAPConnection";
import {accountToConfig} from "./Infrastructure/Helpers/ConfigHelper";
import {IMailAccount} from "./Database/Documents/IUser";
import {deleteAllMails, saveAllMails} from "./Database/Models/DMail";
import {createTransport} from "nodemailer";

// Function to test the addition of an email account to the global account.
function test_save_account() {
    userModel.findOne({email: "test@maxiemgeldhof.com"}).then((user) => {
        const account = {
            email: "maxiem@maxiemgeldhof.com",
            password: "",
            server: {
                host: "maxiemgeldhof.com",
                port: 993,
                tls: true,
                authTimeout: 1000,
                type: "input",
            },
        };
        deriveKey("12345", user.iv)
            .then((key) => encrypt("e8e85cmc", key, generateIv()))
            .then((pass) => {
                account.password = pass;
                user.addAccount(account);
            });
    });
}

function getAllMailAccounts(user): Promise<IMailAccount[]> {
    return user.getDecryptedMailAccounts();
}

function getAllMailsFromAccount(): Promise<IDTOMail[]> {
    return userModel.findOne({email: "maxiemgeldhof@msn.com"}).then((user) => {
        return getAllMailAccounts(user).then((x) => {
            return new IMAPConnection(accountToConfig(x[0]), user).getAllMails();
        });
    });
}

function saveMailsToDatabase() {
    getAllMailsFromAccount().then((x) => saveAllMails(x));
}

function deleteMailsFromDatabase() {
    userModel.findOne({email: "maxiemgeldhof@msn.com"}).then((user) => {
        deleteAllMails(user);
    });
}

connectMongo();

const transporter = createTransport({
    host: 'maxiemgeldhof.com',
    port: 587,
    secure: false,
    auth: {user: "maxiem@maxiemgeldhof.com", pass: "e8e85cmc"},
});
let mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: 'maxiem@maxiemgeldhof.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
};
transporter.sendMail(mailOptions, (error, info) => {
    console.log(error, info);
});