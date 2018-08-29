import {userModel} from "./Database/Models/DUser";
import {deriveKey, encrypt, generateIv} from "./Infrastructure/Imap-Simple/IMAPEncryptDecrypt";
import {connectMongo} from "./Database/mongoose-handler";
import {IDTOMail} from "./Database/Documents/IMail";
import {IMAPConnection} from "./Infrastructure/Imap-Simple/Connection";
import {accountToConfig} from "./Infrastructure/Helpers/ConfigHelper";
import {IDTOUser, IMailAccount} from "./Database/Documents/IUser";
import {deleteAllMails, emailModel, saveAllMails} from "./Database/Models/DMail";
import {sync, syncBox} from "./Infrastructure/Imap-Simple/SyncService";

// Function to test the addition of an email account to the global account.
function test_save_account() {
   userModel.findOne({email: "test@maxiemgeldhof.com"}).then((user) => {
       const account =  {
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
    userModel.findOne({email: "maxiemgeldhof@msn.com"}).then((user) => {deleteAllMails(user); });
}

connectMongo();

userModel.findOne({email: "test@maxiemgeldhof.com"}).then((user) =>  {
    deriveKey("12345", user.iv).then( (key) => {
        user.key = key;
        sync(user);
        const paginOptions = {
            sort: {date: 1 },
            page:  1,
            limit: 20,
        };
        emailModel.paginate({userid: user._id, recip: "maxiem@maxiemgeldhof.com", mailbox: "INBOX"}, paginOptions)
            .then((result) => {
                console.log(result.docs);
            });
});
});

// test_save_account();
// const registerInfo: IDTOUser = {
//     email: "test@maxiemgeldhof.com",
//     password: "12345",
//     accounts : [],
//  };
// userModel.create(registerInfo);
