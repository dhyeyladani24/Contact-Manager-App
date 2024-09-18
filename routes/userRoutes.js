const express = require("express");
const multer = require('multer');
const { registerUser,currentUser,loginUser,exportContacts,importContacts,getFavoriteContacts,favoriteContact,addLabel,removeLabel,getContactsByLabel } = require("../Controller/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router =  express.Router();

const upload = multer({ dest: 'uploads/' });

router.post("/register", registerUser);

router.post("/login",loginUser );

// for pvt route validating token
router.get("/current",validateToken, currentUser);

// import and export
router.get("/export",validateToken, exportContacts);
router.route('/import').post(validateToken, upload.single('file'), importContacts);

router.route('/favorite/:id').put(validateToken, favoriteContact);
router.route('/favorites').get(validateToken, getFavoriteContacts);

router.route('/label/:id').put(validateToken, addLabel).delete(validateToken, removeLabel);
router.route('/labels/:label').get(validateToken, getContactsByLabel);

module.exports = router
