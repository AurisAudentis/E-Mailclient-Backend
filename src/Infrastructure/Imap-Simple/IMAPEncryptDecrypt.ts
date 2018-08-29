import crypto = require("crypto");

// Takes a string to be encrypted, pass, and iv. Returns a promise with encrypted message + iv for storage.
export function encrypt(toEncrypt, key, iv): Promise<string> {
    iv = Buffer.from(iv, "hex");
    return new Promise((resolve, reject) => {
            const mykey = crypto.createCipheriv("aes256", key, iv);
            let str = mykey.update(toEncrypt, "utf8", "hex");
            str += mykey.final("hex");
            resolve(str + Buffer.from(iv).toString("hex"));
    });
}

// Decrypts message by iv and key.
export function decrypt([toDecrypt, iv], key): Promise<string> {
    return new Promise((resolve, reject) => {
        const mydkey = crypto.createDecipheriv("aes256", key, iv);
        const buffer = mydkey.update(toDecrypt, "hex") + mydkey.final("hex");
        resolve(Buffer.from(buffer, "hex").toString("utf8"));
    });
}

// Unpacks IV from message
export function unpackIv(toDecrypt: string): [string, Buffer] {
    const iv = Buffer.from(toDecrypt.substr(toDecrypt.length - 32), "hex");
    const message = toDecrypt.substr(0, toDecrypt.length - 32);
    return [message, iv];
}

// Derives key with iv.
export function deriveKey(key, iv): Promise<string> {
    iv = Buffer.from(iv, "hex");
    return new Promise(((resolve, reject) => {
        crypto.pbkdf2(key, iv, 5000, 16, "sha256", (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            resolve(derivedKey.toString("hex"));
        });
    }));
}

export function generateIv() {
    return Buffer.from(crypto.randomBytes(16)).toString("hex");
}
