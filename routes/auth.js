const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt")
// Register
router.post("/register", async (req, res) => {
    try {
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //create new user
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isAdmin: req.body.isAdmin, // Provide a valid boolean value for isAdmin
        });
        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user)
    } catch (error) {
        // Handle the error, log it, or send an appropriate response
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//Login
router.post("/login", async(req, res) => {
    try{
        const user = await User.findOne({email: req.body.email});
        //Check if the user exists
        if(!user){
            return res.status(404).json("User Not Found");
        }

        //Check if the provided password matches the stored password
        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if(!validPassword){
            return res.status(401).json("Invalid Password");
        }
        res.status(200).json(user);
    }catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;
