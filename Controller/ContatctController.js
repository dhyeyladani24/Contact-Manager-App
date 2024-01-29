const asyncHandler = require("express-async-handler") // by using this we dont need to pass all blocks into try-catch block..because async handler will automatiaclly catch the error if it's occurred
const Contact = require("../models/contactModel");
//@desc Get all contacts
//@route Get /api/contacts
//@access private 
const getContacts = asyncHandler(async(req,res) => {

    const contacts = await Contact.find({user_id:req.usr.id});
    res.status(200).json(contacts);
})

//@desc Create new contacts
//@route post /api/contacts
//@access private 
const createContacts =asyncHandler( async(req,res) => {
    console.log("the request body is", req.body);
    const {name, email, phone} = req.body;
    if(!name || !email || !phone){
        res.status(400);
        throw new Error("all fields are mandatory");
    }
    const contact = await Contact.create({
        name,email,phone,user_id:req.usr.id
    });
    res.status(201).json(contact);
})

//@desc get contacts
//@route get /api/contacts/:id
//@access private 
const getContact = asyncHandler(async(req,res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(400);
        throw new Error("Contact not found");
    }
    res.status(200).json(contact);
})

//@desc update contacts
//@route put /api/contacts/:id
//@access private 
const updateContacts = asyncHandler(async(req,res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(400);
        throw new Error("Contact not found");
    }
    if(contact.user_id.toString() !== req.usr.id){
        res.status(403);
        throw new Error("User don't have access to update other user contact");
    }
    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true}
    );
    res.status(200).json(updateContacts);
})

//@desc delete contacts
//@route DELETE /api/contacts/:id
//@access private 
const deleteContacts = asyncHandler(async(req,res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(400);
        throw new Error("Contact not found");
    }
    if(contact.user_id.toString() !== req.usr.id){
        res.status(403);
        throw new Error("User don't have access to update other user contact");
    }
    await Contact.deleteOne({_id: req.params.id});
    res.status(200).json(contact);
})

module.exports = {getContacts, createContacts, getContact, deleteContacts, updateContacts};