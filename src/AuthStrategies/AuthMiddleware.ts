export function isAuthed(req, res, next) {
    if (req.isAuthenticated()) {// The key must be stored client-side for stateless
        req.user.key = req.headers["mail-password-key"];
        return next();
    }
    res.status(409).end();
}
