const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
    try {
        const { products, user, totalAmount } = req.body;

        const order = await Order.create({
            products,
            user,
            totalAmount,
            status: "Pending",
        });

        res.status(201).json({ message: "Order created successfully", data: order });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const orders = await Order.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments();

        res.status(200).json({
            data: orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};
