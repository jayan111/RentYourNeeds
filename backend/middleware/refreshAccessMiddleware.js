const jwt = require("jsonwebtoken");
const { refreshTokens } = require("../controllers/authController");

// Checks Authorization header Bearer <token>, decodes exp, and if token is about to expire (thresholdSeconds),
// tries to refresh using refresh cookie. If refreshed, sets 'x-access-token' header on the response.
module.exports = function refreshAccessMiddleware(options = {}) {
	const thresholdSeconds = options.thresholdSeconds || 120; // refresh if less than 2 minutes remaining

	return async (req, res, next) => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

			const accessToken = authHeader.split(" ")[1];
			const decoded = jwt.decode(accessToken);
			if (!decoded || !decoded.exp) return next();

			const now = Math.floor(Date.now() / 1000);
			const timeLeft = decoded.exp - now;

			// If token has sufficient time left, do nothing
			if (timeLeft > thresholdSeconds) return next();

			// Token is near expiry — attempt to refresh using refresh token cookie
			const refreshToken = req.cookies?.refreshToken;
			if (!refreshToken) return next();

			try {
				const { accessToken: newAccessToken } = await refreshTokens(refreshToken, res);
				// expose new access token in header so frontend can update stored token
				res.setHeader("x-access-token", newAccessToken);
				// also update req.headers so downstream handlers see the fresh token
				req.headers.authorization = `Bearer ${newAccessToken}`;
			} catch (err) {
				// refresh failed — do not block request, proceed (will fail auth if required)
				console.error("refreshAccessMiddleware: refresh failed:", err.message);
			}
		} catch (e) {
			console.error("refreshAccessMiddleware error:", e);
		}
		return next();
	};
};
