const jwt = require("jsonwebtoken");
const createError = require("./error");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(createError(401, "You are not authenticated!"));
  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token invalid!"));
    req.user = user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) {
      return next(err); // Pass the error to the error handler
    }
    if (req.user.isAdmin) {
      next(); // User is an admin, proceed to the next middleware
    } else {
      return next(createError(403, "You are not authorized!")); // User is not an admin, return a Forbidden error
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
