const path = require("path");
const Product = require("../models/Product"); // add model require

// Update product creation logic
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, condition, location, subscriptionDurations } = req.body;

        // Debug: log what multer provided
        console.log("Uploaded - req.files:", req.files, " req.file:", req.file);

        // Support both array uploads and single-file uploads
        const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
        const images = files.map(file => `uploads/${file.filename}`);

        // create product (ensure schema accepts these fields)
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            condition,
            location,
            subscriptionDurations,
            images,
            imageData: images, // store same paths; change to base64 if desired
        });

        // Return product with full image URLs
        const out = {
            ...product.toObject(),
            images: (product.images || []).map(img => `${req.protocol}://${req.get("host")}/${img}`),
            imageData: product.imageData || [],
        };

        res.status(201).json({ message: "Product created successfully", data: out });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

// Update product retrieval logic
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 9, search, category, maxPrice } = req.query;
        const query = {};

        if (search) query.name = { $regex: search, $options: "i" };
        if (category) query.category = category;
        if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };

        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            data: products.map(product => {
                const obj = product.toObject();
                return {
                    ...obj,
                    images: (obj.images || []).map(image => `${req.protocol}://${req.get("host")}/${image}`),
                };
            }),
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
            limit: parseInt(limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

exports.getCustomerProducts = async (req, res) => {
    try {
        const products = await Product.find({ is_active: true }); // Only active products
        const out = products.map(p => {
            const obj = p.toObject();
            return {
                ...obj,
                images: (obj.images || []).map(image => `${req.protocol}://${req.get("host")}/${image}`),
            };
        });
        res.status(200).json({ data: out });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};
