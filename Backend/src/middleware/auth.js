const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../model/User"); // Adjust the path to your User model

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

// Set up Passport JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id); // Fetch user by ID from JWT payload
      if (user) {
        return done(null, user); // Success, pass user to next middleware
      } else {
        return done(null, false); // User not found
      }
    } catch (error) {
      return done(error, false); // Error occurred
    }
  })
);

// Authentication middleware
exports.authenticate = passport.authenticate("jwt", { session: false });

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.error("Authentication error:", err.stack); // Log error for debugging
      return next(err); // Pass error to error handler
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized access - please log in" });
    }
    req.user = user;
    next();
  })(req, res, next);
};
