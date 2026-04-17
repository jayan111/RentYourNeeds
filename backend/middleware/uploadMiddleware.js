const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads dir exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir); // use ensured directory
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		console.error("Invalid file type:", file.mimetype);
		cb(new Error("Invalid file type. Only JPEG, PNG, SVG, WEBP are allowed."));
	}
};

// Initialize multer with storage and file filter
const upload = multer({ storage, fileFilter });

module.exports = upload;
