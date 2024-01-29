const asyncHandler = require("express-async-handler") // by using this we dont need to pass all blocks into try-catch block..because async handler will automatiaclly catch the error if it's occurred
const user = require("../models/userModel")
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");
//@desc Register user
//@route post /api/user/register
//@access public 
const registerUser = asyncHandler(async  (req,res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("all fields are mandatory")
    }
    //for existing user check
    const userAvailable = await user.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already registered")
    }
    // Hash pswd
    const hashpswd = await bcrypt.hash(password,10);
    console.log("Hashed pswd",hashpswd);
    const usr = await user.create({
        username,email,password:hashpswd,
    });
    console.log(`user created ${usr}`);
    if(usr){
        res.status(201).json({_id:usr.id,email:usr.email});
    }
    else{
        res.status(400);
        throw new Error("User data is not valid");
    }
    res.json({message : "Register the user"});
})

//@desc Register user
//@route post /api/user/login
//@access public 
const loginUser = asyncHandler(async  (req,res) => {
    const {email, password} = req.body;
    if (!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory")
    }
    const usr = await user.findOne({email});
    //compare password with hased password
    if(usr && (await bcrypt.compare(password,usr.password))){
        const accessToken = jwt.sign({
            usr: {
                username:usr.username,
                email:usr.email,
                id:usr.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : "20m"}
        );   
        res.status(200).json({accessToken});
    }
    else{
      res.status(401);
      throw new Error("Email oor password is not valid..")  
    } 
    res.json({message : "Login user"});
})

//@desc Current user info
//@route post /api/user/current
//@access public 
const currentUser = asyncHandler(async  (req,res) => {
    res.json(req.usr);
})

module.exports = {registerUser,loginUser, currentUser};