import {Strategy as BearerStrategy } from "passport-http-bearer"
import {verify} from "jsonwebtoken"
import needle = require("needle");
import config from "../../config/config";
import {userModel} from "../../Database/Models/DUser";

let key;
needle("get", `${config.oauthUrl}/key`)
    .then(resp => key = resp.body);

export const bearerStrategy = new BearerStrategy(
    ((token, done) => {
        verify(token, key, (err, decoded) => {
            if (err) {done({name: "JWTExpiredErr", message: "The JWT is expired", status: 401}); return;}
            userModel.findOne({uid: decoded.uid})
                .then(user => done(null, user))
                .catch(err => {console.log(err); done(err)})
        })

    })
);


