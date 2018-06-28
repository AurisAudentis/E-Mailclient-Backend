export function isAuthed(req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.session.key);
        req.user.key = req.session.key;  // The key must be stored in session, but belongs in the user.
        return next();
    }
    res.status(409);
    res.end();
}
