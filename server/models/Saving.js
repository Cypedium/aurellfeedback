const { getDaysInMonth } = require('date-fns');
const { be } = require('date-fns/locale');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    productId: { type: String, required: true },
    username: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', cardSchema);
