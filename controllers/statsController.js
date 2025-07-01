// statsController.js
const Property = require('../models/property'); // ✅ Correct model
const Agent = require('../models/agent');       // ✅ Agent model
const Booking = require('../models/booking');   // ✅ Booking model

exports.getStats = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const totalAgents = await Agent.countDocuments();
        const totalBookings = await Booking.countDocuments({ status: 'pending' });
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
exports.getInvestorStats = async (req, res) => {
  try {
    // Count total investors
    const totalInvestors = await User.countDocuments({ role: 'investor' });

    // Optional: count properties owned by investors (if using `userId` in Property model)
    const investorProperties = await Property.countDocuments({
      userId: { $exists: true }
    });

    // Optional: total bookings made by investors (if stored)
    const investorBookings = await Booking.countDocuments({
      userId: { $exists: true }
    });

    return res.status(200).json({
      totalInvestors,
      investorProperties,
      investorBookings
    });
  } catch (error) {
    console.error('Investor Stats Error:', error);
    return res.status(500).json({
      message: 'Failed to get investor stats',
      error: error.message
    });
  }
};
