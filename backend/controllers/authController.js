const jwt = require("jsonwebtoken");

// simple in-memory refresh token store (replace with DB for production)
const refreshTokenStore = new Set();

function generateAccessToken(payload) {
	return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload) {
	return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// call this after successful authentication (login) to issue tokens
exports.issueTokensForUser = (res, userPayload) => {
	const accessToken = generateAccessToken(userPayload);
	const refreshToken = generateRefreshToken(userPayload);
	refreshTokenStore.add(refreshToken);

	// set httpOnly cookie for refresh token
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});

	return { accessToken, refreshToken };
};

// New: function to refresh/rotate tokens given a refresh token string.
// Returns { accessToken, refreshToken } or throws.
exports.refreshTokens = async (token, res) => {
	if (!token) throw new Error("Refresh token required");
	if (!refreshTokenStore.has(token)) throw new Error("Refresh token not recognized");

	// verify and create new tokens
	const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
	const payload = { userId: user.userId, email: user.email, role: user.role };

	// rotate
	refreshTokenStore.delete(token);
	const newAccessToken = generateAccessToken(payload);
	const newRefreshToken = generateRefreshToken(payload);
	refreshTokenStore.add(newRefreshToken);

	// set cookie if 'res' provided
	if (res) {
		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
	}

	return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

exports.refreshToken = async (req, res) => {
	try {
		// accept refreshToken from cookie or body
		const token = req.cookies?.refreshToken || req.body?.refreshToken;
		if (!token) return res.status(401).json({ message: "Refresh token is required" });

		// use shared function
		const { accessToken } = await exports.refreshTokens(token, res);
		res.status(200).json({ accessToken });
	} catch (error) {
		console.error("refreshToken error:", error.message);
		if (error.message.includes("recognized") || error.message.includes("required")) {
			return res.status(403).json({ message: error.message });
		}
		res.status(500).json({ message: "Error refreshing token", error: error.message });
	}
};

exports.logout = async (req, res) => {
	try {
		const token = req.cookies?.refreshToken || req.body?.refreshToken;
		if (token && refreshTokenStore.has(token)) {
			refreshTokenStore.delete(token);
		}
		// clear cookie
		res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
		return res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error logging out", error: error.message });
	}
};
