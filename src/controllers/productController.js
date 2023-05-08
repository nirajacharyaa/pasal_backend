import Category from "../model/categoryModel.js";
import Product from "../model/productModel.js";

export const addProduct = async (req, res, fileName) => {
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const category = await Category.findById(req.body.category);
  if (!req.file) {
    return res.status(400).json({ success: false, msg: "image is required" });
  }
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    stockCount: req.body.stockCount,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  };
  if (category) {
    try {
      const createdProduct = await Product.create(newProduct);
      if (!createdProduct) {
        return res.status(400).json({
          success: false,
          msg: "the product cannot be created",
        });
      }
      return res.status(200).json(createdProduct);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err,
      });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, msg: "The category doesn't exist" });
  }
};
