const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
    try {
      const loggedInUser = req.user;
  
      if (!loggedInUser) {
        return res.status(401).json("User not authenticated");
      }
  
      if (loggedInUser.isAdmin || req.body.userId === req.params.id) {
        if (req.body.password) {
          try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
          } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json("Error hashing password");
          }
        }
  
        try {
          const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  
          if (!user) {
            return res.status(404).json("User not found.");
          }
  
          return res.status(200).json("Account has been updated");
        } catch (err) {
          console.error("Error updating user:", err);
          return res.status(500).json("Error updating user");
        }
      } else {
        return res.status(403).json("You can update only your account or as an admin");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json("Internal Server Error");
    }
  });
  


//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can delete only your account!");
    }
  });
//get a user
router.get("/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      res.status(500).json(err);
    }
  });
//follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          res.status(200).json("user has been followed");
        } else {
          res.status(403).json("you allready follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant follow yourself");
    }
  });
//unfollow a user
module.exports = router