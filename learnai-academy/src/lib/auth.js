import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret";
export function sign(payload){ return jwt.sign(payload, SECRET, { expiresIn: "7d" }); }
export function verify(token){ try { return jwt.verify(token, SECRET); } catch { return null; } }
