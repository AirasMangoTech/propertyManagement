const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: String,
    price: Number,
    unit_number: String,
    selling_price_sqft: Number,

    type: String,
    rental_price: Number,
    area: String,
    rental_price_per_sqft: Number,
    address: String,
    annual_rent: Number,

    features: [String],
    service_charges: Number,
    rented_vacant: String, // Could also be Boolean depending on how you handle it

    parking_space: Number,
    category: String,
    comments: String,
    purpose: String,
    description: String,

    images: [String],
    brochureDocumment: String, // Consider renaming to `brochureDocument` (typo?)
    buildingLayout: String,

    tenure_years: Number,
    contract_value: Number,
    lease_start_date: Date,
    lease_end_date: Date,

    // Optional: keep for compatibility if needed
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
