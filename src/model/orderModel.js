import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  totalPrice: {
    type: Number,
  },
  dateOrdered: {
    type: Date,
    default: Date.now(),
  },
});

orderSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Order", orderSchema);
