import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

        const verified = jwt.verify(token, "SECRET_KEY");
        req.user = verified;
        next();

    } catch (error) {
        res.status(401).json({ error: "Invalid Token" });
    }
};