const asyncHandler = require("express-async-handler") // by using this we dont need to pass all blocks into try-catch block..because async handler will automatiaclly catch the error if it's occurred
const user = require("../models/userModel")
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Contact = require("../models/contactModel")
const fs = require('fs');
const path = require('path');

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
        username,email
        // pswd is stored is as hashpswd in db
        ,password:hashpswd,
    });
    console.log(`user created ${usr}`);
    // not sending complete user info only passing  id,email 
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
//@access private 
const currentUser = asyncHandler(async  (req,res) => {
    res.json(req.usr);
})

//export contact
const exportContacts = asyncHandler(async(req, res) => {
    // console.log(req.params.id)
    const contacts = await Contact.find({ user_id: req.usr.id }).select('name email phone -_id');
    const filePath = path.join(__dirname, '../exports', `contacts_${req.usr.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
    res.download(filePath, `contacts_${req.usr.id}.json`, (err) => {
        if (err) {
            res.status(500).json({ message: "Could not download the file" });
        }
        fs.unlinkSync(filePath); // Delete the file after sending it
    });
});


//import contact 
const importContacts = asyncHandler(async(req, res) => {
    if (!req.file) {
        res.status(400).json({ message: "Please upload a file" });
        return;
    }
    console.log(req.file);
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newContacts = contacts.map(contact => ({
        user_id: req.usr.id,
        ...contact
    }));
    fs.unlinkSync(filePath); // Delete the file after reading it
    const savedContacts = await Contact.insertMany(newContacts);
    res.status(201).json(savedContacts);
});

// Mark contact as favorite
const favoriteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(400);
        throw new Error("Contact not found");
    }
    if (contact.user_id.toString() !== req.usr.id) {
        res.status(403);
        throw new Error("User doesn't have access to update this contact");
    }
    contact.favorite = !contact.favorite;
    await contact.save();
    res.status(200).json(contact);
});

// Get favorite contacts
const getFavoriteContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({ user_id: req.usr.id, favorite: true });
    res.status(200).json(contacts);
});

// Add a label to a contact
const addLabel = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(400);
        throw new Error("Contact not found");
    }
    if (contact.user_id.toString() !== req.usr.id) {
        res.status(403);
        throw new Error("User doesn't have access to update this contact");
    }
    const { label } = req.body;
    if (!label) {
        res.status(400);
        throw new Error("Label is required");
    }
    if (!contact.labels.includes(label)) {
        contact.labels.push(label);
        await contact.save();
    }
    res.status(200).json(contact);
});

// Remove a label from a contact
const removeLabel = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(400);
        throw new Error("Contact not found");
    }
    if (contact.user_id.toString() !== req.usr.id) {
        res.status(403);
        throw new Error("User doesn't have access to update this contact");
    }
    const { label } = req.body;
    if (!label) {
        res.status(400);
        throw new Error("Label is required");
    }
    contact.labels = contact.labels.filter(l => l !== label);
    await contact.save();
    res.status(200).json(contact);
});

// Get contacts by label
const getContactsByLabel = asyncHandler(async (req, res) => {
    const { label } = req.params;
    const contacts = await Contact.find({ user_id: req.usr.id, labels: label });
    res.status(200).json(contacts);
});

module.exports = {registerUser,loginUser, currentUser,importContacts,exportContacts,getFavoriteContacts,favoriteContact,addLabel,getContactsByLabel,removeLabel};