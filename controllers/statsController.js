// statsController.js
const Property = require('../models/property'); // ✅ Correct model
const Agent = require('../models/agent');       // ✅ Agent model
const Booking = require('../models/booking');   // ✅ Booking model

exports.getStats = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const totalAgents = await Agent.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalApprovedBookings = await Booking.countDocuments({ status: 'approved' });

        return res.status(200).json({
            totalProperties,
            totalAgents,
            totalBookings,
            totalApprovedBookings,
        });
    } catch (error) {
        console.error('Stats Error:', error);
        return res.status(500).json({ message: 'Failed to get stats', error: error.message });
    }
};
