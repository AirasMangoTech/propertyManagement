const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: String,
    price: Number,
    type: String,
    purpose: String,
    area: String,
    address: String,
    location: String,
    refno: String,
    features: [String],
    latitude: Number,
    longitude: Number,
    beds: Number,
    baths: Number,
    description: String,
    investors: [String],
    images: [String],
    category: {
        type: String,
        enum: ['furnished', 'unfurnished'],
    },
    payment_terms: String,
    agents: Array,
    timing: Array,
    status: { type: String, default: "pending" },
    bookedDates: Array,
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
