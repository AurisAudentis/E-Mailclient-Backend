import {userModel} from "./Database/Models/DUser";
import {deriveKey, encrypt, generateIv} from "./Imap-Simple/IMAPEncryptDecrypt";
import {connectMongo} from "./Database/mongoose-handler";
import {IDTOMail} from "./Database/Documents/IMail";
import {IMAPConnection} from "./Imap-Simple/Connection";
import {accountToConfig} from "./Helpers/ConfigHelper";
import {IDTOUser, IMailAccount} from "./Database/Documents/IUser";
import {deleteAllMails, saveAllMails} from "./Database/Models/DMail";

// Function to test the addition of an email account to the global account.
function test_save_account() {
   userModel.findOne({email: "test@maxiemgeldhof.com"}).then((user) => {
       const account =  {
           email: "maxiemgeldhof@msn.com",
           password: "",
           server: {
               host: "imap-mail.outlook.com",
               port: 993,
               tls: true,
               authTimeout: 100,
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
        getAllMailAccounts(user).then((accs) => new IMAPConnection(accountToConfig(accs[1]), user).test())
       .then(console.log);
}); });
// test_save_account();
// const registerInfo: IDTOUser = {
//     email: "test@maxiemgeldhof.com",
//     password: "12345",
//     accounts : [],
//  };
// userModel.create(registerInfo);
