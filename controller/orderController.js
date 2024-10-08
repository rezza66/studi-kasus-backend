import { Types } from "mongoose";
import CartItem from "../models/cartItemModel.js";
import DeliveryAddress from "../models/deliveryAddressModel.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";

export const getOrder = async (req, res, next) => {
  try {
    const { skip = 0, limit = 10 } = req.query;
    const count = await Order.find({ user: req.user._id }).countDocuments();
    const orders = await Order.find({ user: req.user._id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("order_items")
      .sort("-createdAt");
    return res.status(200).json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
      count,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json({
        errorNumber: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { delivery_fee, delivery_address } = req.body;
    const items = await CartItem.find({ user: req.user._id }).populate(
      "product"
    );
    if (!items) {
      return res.status(400).json({
        errorNumber: 1,
        message: "You are not create order because you have not items in cart",
      });
    }
    const address = await DeliveryAddress.findById(delivery_address);
    const order = new Order({
      _id: new Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee: delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });
    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.price),
        order: order._id,
        product: item.product._id,
      }))
    );
    orderItems.forEach((item) => order.order_items.push(item));
    order.save();
    await CartItem.deleteMany({ user: req.user._id });
    return res.status(201).json(order);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json({
        errorNumber: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error);
  }
};
