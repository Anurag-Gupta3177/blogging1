const {Schema , model} = require("mongoose")
const {createHmac , randomBytes} = require("crypto");
const { createToken } = require("../services/authentication");

const userSchema = new Schema({
    
    fullName : {
        type : String,
        required : true,
    },
    email : {
        type : String,

        unique : true,
    },
    salt : {
        type : String,
    },
    password : {
        type : String,
        required : true,       
    },
    profileImageURL : {
        type : String,
        default : "/images/default.png",
    },
    role : {
        type : String,
        enum : ["USER" , "ADMIN"],
        default : "USER",
    },
},
 {timestamps : true}
);

userSchema.pre("save" , function(next){

    const user = this;
    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashPassword = createHmac("sha256" , salt)
      .update(user.password)
      .digest("hex")

    this.salt = salt;
    this.password = hashPassword;

    next();
})

 

userSchema.static("matchPassword", async function(email, password){
    try {
        // const user = await this.findOne({email});
        const user = await this.findOne({email}).select('+email');
        if(!user) throw new Error("User not found");

        const salt = user.salt;
        const hashedPassword = user.password;

        const userProvidedHash = createHmac("sha256", salt)
            .update(password)
            .digest("hex");

        if(hashedPassword !== userProvidedHash)
            throw new Error("Password is incorrect");

        // Remove sensitive fields from the user object
        // const userObject = user.toObject();
        // delete userObject.password;
        // delete userObject.salt;

        console.log("User found:", user);

        const token = createToken(user);
        return token;

    } catch (error) {
        // Instead of throwing, we return an object with an error property
        return res.render("signin" , {
            error : "Incorrect password or email"
        })
    }
});
const User = model("user" , userSchema);

module.exports = User;
