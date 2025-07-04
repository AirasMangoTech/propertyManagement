const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: String,
    email: String,
    agent_id: String,
    property_id: String,
    doc: String,
    date: Date,
    time: String,
    notes: String,
    feedback: {
        type: Object,
        default: null
    }
    ,
    status: { type: String, default: 'pending' }  // optional
});

module.exports = mongoose.model('booking', agentSchema);
