import jwt from "jsonwebtoken"
const createTokenAndSaveCookie = (userId,res) =>{
    const token = jwt.sign({userId},process.env.JWT_TOKEN,{
        expiresIn:"10d"
    });
    res.cookie("jwt",token,{
        httpOnly:true,  // secure from xss 
        secure:true,
        sameSite:"strict" //
    });
} 
export default createTokenAndSaveCookie;