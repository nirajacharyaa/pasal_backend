import express from "express";
import Category from "../model/categoryModel.js";
import auth from "../middleware/authMiddleware.js";
import adminAuth from "../middleware/adminAuthMiddlware.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).json(categoryList);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Categories cannot be retrieved" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const category = await Category.findById(id);
      if (category) {
        return res.status(200).json(category);
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }
});

router.post("/", [auth, adminAuth], async (req, res) => {
  const newCategory = {
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
  };

  try {
    const category = await Category.create(newCategory);
    return res.status(200).json(category);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.delete("/:id", [auth, adminAuth], async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const category = await Category.findByIdAndDelete(id);
      if (category) {
        res
          .status(200)
          .json({ success: true, message: "category deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }
});

router.put("/:id", [auth, adminAuth], async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        {
          name: req.body.name,
          icon: req.body.icon,
          color: req.body.color,
        },
        { new: true }
      );

      if (!category) {
        res
          .status(400)
          .json({ success: false, message: "Category could not be updated" });
      }
      return res.status(200).json(category);
    } catch (err) {
      return res.status(500).json({ success: false, error: err });
    }
  }
});

export default router;
