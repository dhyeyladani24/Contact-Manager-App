const express = require("express");
const router =  express.Router();
const {getContacts, createContacts, getContact, deleteContacts, updateContacts} = require("../Controller/ContatctController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken)
router.route("/").get (getContacts).post (createContacts);
router.route("/:id").get (getContact).put (updateContacts).delete (deleteContacts);

module.exports =  router;