import jwt from "jsonwebtoken"
const createTokenAndSaveCookie = (userId,res) =>{
    const token = jwt.sign({userId},process.env.JWT_TOKEN,{
        expiresIn:"10d"
    });
    res.cookie("jwt", token, {
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds (persists across browser restarts)
        httpOnly: true,  // secure from XSS
        secure: process.env.NODE_ENV === "production", // only true over HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allows cross-origin requests in production
    });
    return token;
}; 
export default createTokenAndSaveCookie;