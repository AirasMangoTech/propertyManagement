const Booking = require('../models/booking');
const Property = require('../models/property');
const { sendSuccess, sendError } = require('../helpers/responseHelper');
const cron = require('node-cron');

exports.createBooking = async (req, res) => {
    try {
        const { date, time, property_id } = req.body;

        // Check if booking already exists for the same date, time, and property
        const existingBooking = await Booking.findOne({ date, time, property_id });

        if (existingBooking) {
            return sendError(res, 'Booking already exists for the selected date and time slot.', 400);
        }

        // If no conflict, proceed with saving the new booking
        const booking = new Booking(req.body);
        await booking.save();
        return sendSuccess(res, 'Booking created successfully', { booking }, 200);
    } catch (err) {
        return sendError(res, 'Something went wrong while creating the booking', 500, err.message);
    }
};


exports.getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const match = {};

    if (search && search.trim() !== "") {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status.trim() !== "") {
      match.status = status.trim().toLowerCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Booking.countDocuments(match);

    const bookings = await Booking.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "properties", // name of the collection (check in MongoDB)
          localField: "property_id",
          foreignField: "_id",
          as: "property"
        }
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } }
    ]);

    return sendSuccess(res, "Bookings fetched successfully", {
      bookings,
      count: total
    });
  } catch (err) {
    console.error("Error in getBookings:", err);
    return sendError(res, "Failed to fetch bookings", 500, err.message);
  }
};





exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);
        return sendSuccess(res, 'Booking fetched successfully', { booking });
    } catch (err) {
        return sendError(res, 'Failed to fetch booking', 500, err.message);
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;

        if (!id) return sendError(res, 'Booking ID is required in body', 400);

        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

        if (!booking) return sendError(res, 'Booking not found', 404);

        return sendSuccess(res, 'Booking updated successfully', { booking });
    } catch (err) {
        return sendError(res, 'Failed to update booking', 500, err.message);
    }
};


exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return sendError(res, 'Booking not found', 404);
        return sendSuccess(res, 'Booking deleted successfully');
    } catch (err) {
        return sendError(res, 'Failed to delete booking', 500, err.message);
    }
};


// Runs every day at 12:00 AM
cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const result = await Booking.deleteMany({ date: { $lt: now } });
        console.log(`[CRON] Deleted ${result.deletedCount} expired bookings`);
    } catch (error) {
        console.error('[CRON] Error deleting expired bookings:', error.message);
    }
});
