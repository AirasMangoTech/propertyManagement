const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: String,
    email: String,
    agent_id:Number,
    property_id:Number,
    doc: String,
    date:Date,
    time:String,
    notes:String,
    status: {type:String,default:'pending'}  // optional
});

module.exports = mongoose.model('booking', agentSchema);
