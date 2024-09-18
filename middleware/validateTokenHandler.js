// validating user token  
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")

const validateToken = asyncHandler(async (req,res,next) => {
    let token;
    // console.log(req);
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        // extracting token...from first index onwards token is there so we accessing firt ind
        token = authHeader.split(" ")[1];
        //verifying 
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded) => {
            if(err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            // verfied the token and extracted info which is in token .. and the info is userinfo(name,email,id) and expiry and creation of token   
            req.usr = decoded.usr;
            next();
        });
        if(!token){
            res.status(401);
            throw new Error("User is not authorized or token is missing in the request");
        }
    }
});

module.exports = validateToken;