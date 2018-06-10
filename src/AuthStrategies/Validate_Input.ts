import {userModel} from "../Database/mongoose-handler";

export function validate(password, minlength, maxlength, chars): string {
    return min_length(max_length(contains(password, chars), maxlength), minlength);
}

function min_length(tovalidate, min): string {
    if (tovalidate.length < min) {
        return "";
    } else {
        return tovalidate;
    }
}

function max_length(tovalidate, max): string {
    if (tovalidate.length > max) {
        return "";
    } else {
        return tovalidate;
    }
}

function contains(tovalidate, chars): string {
    let bool = true;
    for (const i of chars) {
        bool = bool && tovalidate.indexOf(i) !== -1;
    }
    if (bool) {
        return tovalidate;
    } else {
        return "";
    }
}

export function uniqueEmail(email): Promise<boolean> {
    return new Promise((resolve, reject) => {
        userModel.findOne({email: email.trim()}).then((user) =>  {
            if (!user) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((err) => reject(err));
    });
}
