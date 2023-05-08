import express from "express";
import User from "../model/userModel.js";
import hashPassword from "../utils/hashPassword.js";
import compareHashPassword from "../utils/comarePasswordHash.js";
import signToken from "../utils/signToken.js";
import auth from "../middleware/authMiddleware.js";
import adminAuth from "../middleware/adminAuthMiddlware.js";
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).json(userList);
});

router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const user = await User.findById(id).select("-passwordHash");
      if (user) {
        return res.status(200).json(user);
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }
});

router.post("/register", async (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    passwordHash: await hashPassword(req.body.password),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    zip: req.body.zip,
    city: req.body.city,
  };
  try {
    const user = await User.create(newUser);
    if (user) {
      return res
        .status(200)
        .json({ success: true, msg: "User successfully created" });
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "User cannot be created" });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (user && compareHashPassword(password, user.passwordHash)) {
      const token = await signToken(user);
      return res.status(200).json({ email, token });
    }
    return res.status(400).json({ success: false, msg: "wrong credentials" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "User cannot login",
    });
  }
});

router.get("/get/count", [auth, adminAuth], async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      return res.status(400).json({ success: false, msg: "Count error" });
    }
    return res.status(200).json({ success: true, userCount });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "Count error" });
  }
});

router.get("/:id", [auth, adminAuth], async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (user) {
        return res.status(200).json(user);
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not deleted" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }
});

export default router;
