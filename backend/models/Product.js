const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    subscriptionDurations: { type: [Number], default: [] },
    images: {
        type: [String], // Array of image file paths
        default: [],
    },
    imageData: {
        type: [String], // Array of image data (e.g., base64 or file paths)
        default: [],
    },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
