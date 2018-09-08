export function isAuthed(req, res, next) {
    console.log("isauthed");
    if (req.isAuthenticated()) {// The key must be stored client-side for stateless
        req.user.key = req.headers["Mail-Password-Key"];
        return next();
    }
    res.status(409).end();
}
