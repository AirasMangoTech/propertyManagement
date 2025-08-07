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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim().toLowerCase();
    const agent_id = req.query.agent_id?.trim();

    const skip = (page - 1) * limit;

    const match = {};

    // Search match
    if (search !== "") {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Filter match
    if (status) match.status = status;
    if (agent_id) match.agent_id = agent_id;

    // Count total records
    const total = await Booking.countDocuments(match);

    // Get available statuses (for filtering frontend)
    const distinctStatuses = await Booking.distinct("status");

    // Fetch paginated bookings sorted by latest first
    const bookings = await Booking.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "properties",
          let: { propertyId: "$property_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$propertyId" }],
                },
              },
            },
          ],
          as: "property",
        },
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },

      // Sort by creation date (latest first)
      { $sort: { date: -1 } },

      { $skip: skip },
      { $limit: limit },
    ]);

    return sendSuccess(res, "Bookings fetched successfully", {
      bookings,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limitPerPage: limit,
      debug: {
        queryUsed: match,
        receivedStatus: status,
        receivedAgentId: agent_id,
        availableStatuses: distinctStatuses,
      },
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

    if (!id) return sendError(res, "Booking ID is required in body", 400);

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    if (!booking) return sendError(res, "Booking not found", 404);

    // If status is approved, update the related property
    if (updateData.status === "approved" && updateData.property_id) {
      const propertyUpdates = {
        $inc: { visitCount: 1 }, // ✅ increment visit count
      };

      // Add booked dates
      if (booking.startDate && booking.endDate) {
        propertyUpdates.$push = {
          bookedDates: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            bookingId: booking._id,
          },
        };
      } else if (booking.date) {
        propertyUpdates.$push = {
          bookedDates: {
            date: booking.date,
            bookingId: booking._id,
          },
        };
      }

      // Add agent to agents array
      if (updateData.agent_id) {
        propertyUpdates.$addToSet = {
          agents: updateData.agent_id,
        };
      }

      // Combine all updates into one atomic update
      await Property.findByIdAndUpdate(updateData.property_id, propertyUpdates);
    }

    return sendSuccess(res, "Booking updated successfully", { booking });
  } catch (err) {
    console.error("Error in updateBooking:", err);
    return sendError(res, "Failed to update booking", 500, err.message);
  }
};


exports.updateFeedback = async (req, res) => {
  try {
    const { id, feedback } = req.body;

    if (!id) return sendError(res, "Booking ID is required", 400);
    if (!feedback || typeof feedback !== 'object')
      return sendError(res, "Feedback object is required", 400);

    // Update the feedback field
    const booking = await Booking.findByIdAndUpdate(
      id,
      { feedback },
      { new: true }
    );

    if (!booking) return sendError(res, "Booking not found", 404);

    return sendSuccess(res, "Feedback updated successfully", { booking });
  } catch (err) {
    console.error("Error in updateFeedback:", err);
    return sendError(res, "Failed to update feedback", 500, err.message);
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




cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const result = await Booking.deleteMany({
            date: { $lt: now },
            status: 'pending' // ✅ Only delete bookings with pending status
        });
        console.log(`[CRON] Deleted ${result.deletedCount} expired pending bookings`);
    } catch (error) {
        console.error('[CRON] Error deleting expired bookings:', error.message);
    }
});
