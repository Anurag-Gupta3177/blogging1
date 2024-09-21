const express = require("express")
const app = express();
const path = require("path")
const PORT = 8000;
const userRoutes = require("./routes/user")
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/blogify")
.then((e) => console.log("Mongodb Connected"))

app.set("view engine" , "ejs")
app.set("views" , path.resolve("./views"))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/" , (req,res) => {
     res.render("home")
})

app.use("/user" , userRoutes)

app.listen(PORT , () => console.log(`Server is running at PORT : ${PORT}` ) )