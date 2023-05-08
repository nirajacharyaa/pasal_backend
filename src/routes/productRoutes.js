import express from "express";
import Product from "../model/productModel.js";
import Category from "../model/categoryModel.js";
import auth from "../middleware/authMiddleware.js";
import adminAuth from "../middleware/adminAuthMiddlware.js";
import multer from "multer";
import { addProduct } from "../controllers/productController.js";
import mongoose from "mongoose";

const router = express.Router();
let imageName;

const LEGAL_FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = LEGAL_FILE_TYPE[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    imageName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "-" +
      file.originalname.trim();
    cb(null, imageName);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  console.log(req.user);
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  try {
    const productList = await Product.find(filter).populate("category");
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).json(productList);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(500).json({ success: false, msg: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post("/", [auth, adminAuth, upload.single("image")], (req, res) => {
  addProduct(req, res, imageName);
});

router.put("/:id", [auth, adminAuth], async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(req.body.category);
  if (category) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          image: req.body.image,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          stockCount: req.body.stockCount,
          rating: req.body.rating,
          numReviews: req.body.numReviews,
          isFeatured: req.body.isFeatured,
          dateCreated: req.body.dateCreated,
        },
        { new: true }
      );

      if (!product) {
        res
          .status(400)
          .json({ success: false, message: "Product could not be updated" });
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ success: false, error: err });
    }
  } else {
    res
      .status(400)
      .json({ success: false, msg: "The product could not be updated" });
  }
});

router.delete("/:id", [auth, adminAuth], async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (product) {
        res
          .status(200)
          .json({ success: true, message: "product deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not fount" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    console.log(productCount);
    if (!productCount) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).json({ productCount });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;

  try {
    const featuredProducts = await Product.find({
      isFeatured: true,
    })
      .limit(+count)
      .populate("category");
    if (!featuredProducts) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).json({ featuredProducts });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.put(
  "/add-images/:id",
  [auth, adminAuth, upload.array("images", 10)],
  async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid product id" });
    }
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const imagePaths = [];
    const files = req.files;
    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }
    try {
      const product = await Product.findByIdAndUpdate(id, {
        images: imagePaths,
      });
      if (product) {
        return res
          .status(200)
          .json({ success: true, msg: "Images successfully updated" });
      }
      return res
        .status(400)
        .json({ success: false, msg: "Images can't updated" });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, msg: "could not update images" });
    }
  }
);

export default router;
