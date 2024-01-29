const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const errorhandler = require("./middleware/errorhandler")
const contactRoutesPath = require("./routes/contactroutes");
const userRoutesPath = require("./routes/userRoutes");
const connectdb = require("./Config/dbconnection");

connectdb();
const port = process.env.PORT || 5000; 

app.use(express.json());
app.use("/api/contacts",contactRoutesPath )
app.use("/api/user",userRoutesPath )
app.use(errorhandler);

app.listen(port, () => {
    console.log(`Sever running on port ${port}`);
});

