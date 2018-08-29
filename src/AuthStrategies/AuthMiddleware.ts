export function isAuthed(req, res, next) {
    console.log("isauthed");
    if (req.isAuthenticated()) {
        req.user.key = req.headers["Mail-Password-Key"];  // The key must be stored in session, but belongs in the user.
        return next();
    }
    res.status(409);
    res.end();
}
