import {sync} from "../Imap-Simple/SyncService";

export function isAuthed(req, res, next) {
    if (req.isAuthenticated()) {
        req.user.key = req.session.key;  // The key must be stored in session, but belongs in the user.
        sync(req.user);
        return next();
    }
    res.status(409);
    res.end();
}
