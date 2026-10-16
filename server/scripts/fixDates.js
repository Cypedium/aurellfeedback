// server/scripts/fixDates.js
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/User");

async function fixNullDates() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const today = new Date();

        const result = await User.updateMany(
            { date: null },
            { $set: { date: today } }
        );

        console.log(`Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating users:", err);
        process.exit(1);
    }
}

fixNullDates();

