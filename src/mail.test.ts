import {userModel} from "./Database/Models/DUser";
import {deriveKey, encrypt, generateIv} from "./Imap-Simple/IMAPEncryptDecrypt";
import {connectMongo} from "./Database/mongoose-handler";
import {IDTOMail} from "./Database/Documents/IMail";
import {IMAPConnection} from "./Imap-Simple/Connection";
import {accountToConfig} from "./Imap-Simple/Helpers/ConfigHelper";
import {IMailAccount} from "./Database/Documents/IUser";
import {deleteAllMails, saveAllMails} from "./Database/Models/DMail";

// Function to test the addition of an email account to the global account.
function test_save_account() {
   userModel.findOne({email: "maxiemgeldhof@msn.com"}).then((user) => {
       const account =  {
           email: "maxiem@maxiemgeldhof.com",
           password: "",
           server: {
               host: "maxiemgeldhof.com",
               port: 993,
               tls: true,
               authTimeout: 3000,
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
    return deriveKey("12345", user.iv)
            .then((key) => user.getDecryptedMailAccounts(key));
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
    userModel.findOne({email: "maxiemgeldhof@msn.com"}).then((user) => {deleteAllMails(user); });
}

connectMongo();
deleteMailsFromDatabase();
