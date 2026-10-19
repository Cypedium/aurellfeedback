const mongoose = require('mongoose');
const { CARD_STATUSES, DEFAULT_CARD_STATUS } = require('../utils/cardStatus');

const cardSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    productId: { type: String, required: true },
    username: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    // Board column, shared by all users
    status: { type: String, enum: CARD_STATUSES, default: DEFAULT_CARD_STATUS }
});

module.exports = mongoose.model('Card', cardSchema);