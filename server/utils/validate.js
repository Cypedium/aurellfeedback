// server/utils/validate.js
const mongoose = require("mongoose");

exports.isNonEmptyString = (value, maxLength) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;

exports.isObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

exports.isValidDate = (value) =>
  (typeof value === "string" || typeof value === "number") &&
  !Number.isNaN(new Date(value).getTime());
