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
    images: [String],
    
    category: String,
    payment_terms: String,
    status: { type: String, default: 'pending' },
    bookedDates: [Date],
    createdAt: Date,
    updatedAt: Date
}, { _id: false }); // prevents Mongo from creating new _id for subdocs

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    properties: [{type: Object}], 
    role: { type: String, default: 'investor' }
});

module.exports = mongoose.model('User', userSchema);
