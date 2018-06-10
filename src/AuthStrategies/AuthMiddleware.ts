export function isAuthed(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login?unauthaccess=true");
}
