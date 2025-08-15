const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    address: String,
    image: String,
    rera_doc: String,
    rera_id: String,
    status:{type:String},
    role: { type: String, default: 'agent' },  // optional
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
