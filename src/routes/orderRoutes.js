import express from "express";
import Order from "../model/orderModel.js";
import OrderItem from "../model/orderItemModel.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ dateOrdered: -1 });
    if (!orderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json(orderList);
  } catch (err) {
    res.status(500).json({ success: false, msg: "cannot fetch orders" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findById(id)
      .populate("user", "name")
      .populate("orderItems");
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.status(200).json(orderList);
  } catch (err) {
    res.status(500).json({ success: false, msg: "cannot fetch order" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const newStatus = req.body.status;
  try {
    const order = await Order.findByIdAndUpdate(
      id,
      {
        status: newStatus,
      },
      { new: true }
    );

    if (!order) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).json(orderList);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "cannot update status" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(500).json({ success: false });
    }
    order.orderItems.map(async (item) => {
      await OrderItem.findByIdAndDelete(item);
    });
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ success: false, msg: "cannot delete order" });
  }
});

router.post("/", async (req, res) => {
  const orderItemsIdsPromise = Promise.all(
    req.body.orderItems.map(async (item) => {
      let newOrderItem = new OrderItem({
        quantity: item.quantity,
        product: item.product,
      });
      try {
        newOrderItem = await OrderItem.create(newOrderItem);
        return newOrderItem._id;
      } catch (err) {
        return res
          .status(500)
          .json({ success: false, msg: "error creating an order" });
      }
    })
  );
  const orderItemsIds = await orderItemsIdsPromise;

  const totalPricesPromise = Promise.all(
    orderItemsIds.map(async (item) => {
      const orderedItem = await OrderItem.findById(item).populate(
        "product",
        "price"
      );
      const totalPrice = orderedItem.product.price * orderedItem.quantity;
      return totalPrice;
    })
  );
  const totalPrices = (await totalPricesPromise).reduce((acc, crr) => {
    return acc + crr;
  });
  console.log(totalPrices);
  const newOrder = {
    user: req.body.user,
    phone: req.body.phone,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    orderItems: orderItemsIds,
    totalPrice: totalPrices,
    status: req.body.status,
    dateOrdered: req.body.dateOrdered,
  };

  try {
    const order = await Order.create(newOrder);
    if (!order) {
      return res
        .status(400)
        .json({ success: false, msg: "Order cannot be created" });
    }
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/get/totalSales", async (req, res) => {
  const totalSales = await Order.aggregate([
    {
      $group: { _id: null, totalSales: { $sum: "$totalPrice" } },
    },
  ]);
  if (totalSales) {
    return res.status(200).json({ success: true, totalSales });
  } else {
    res.status(400).json({ success: false });
  }
});
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

export default router;
