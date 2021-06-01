const authMiddleWare = {};
authMiddleWare.checkEntityHeader = (req, res, next) => {
    try {
        if (req.headers.entity !== global.CONFIG.TOKEN) {
            return res.status(403).json({ error: 'No credentials sent!' });
        }
        next();
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};

authMiddleWare.checkLogin = (req, res, next) => {
    try {
        if (!req.session.isLogin) {
            // return res.redirect(301, '/login.html');
            return res.status(403).json({ error: '301' });
        }
        next();
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};

module.exports = authMiddleWare;