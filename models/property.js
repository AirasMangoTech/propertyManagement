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
    latitude:Number,
    longitude:Number,
    beds: Number,
    baths: Number,
    description: String,
    images: [String],
    category: {
        type: String,
        enum: ['furnished', 'unfurnished'],
    },
    payment_terms: String,
    timing: String,
    status: { type: String, default: "pending" },
    bookedDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
