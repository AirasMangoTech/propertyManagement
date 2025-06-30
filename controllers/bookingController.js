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
    const { page = 1, limit = 10, search = "", status } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const match = {}

    if (search && search.trim() !== "") {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status.trim() !== "") {
      match.status = status.trim().toLowerCase()
    }

    const total = await Booking.countDocuments(match)

    const distinctStatuses = await Booking.distinct("status")

    const bookings = await Booking.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number.parseInt(limit) },
      // This step joins the `property_id` with the `_id` in the `properties` collection
      {
        $lookup: {
          from: "properties", // actual MongoDB collection name
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
      {
        $unwind: {
          path: "$property",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])

    return sendSuccess(res, "Bookings fetched successfully", {
      bookings,
      count: total,
      debug: {
        receivedStatus: status,
        queryUsed: match,
        availableStatuses: distinctStatuses,
      },
    })
  } catch (err) {
    console.error("Error in getBookings:", err)
    return sendError(res, "Failed to fetch bookings", 500, err.message)
  }
}





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
    const { id, ...updateData } = req.body

    if (!id) return sendError(res, "Booking ID is required in body", 400)

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true })

    if (!booking) return sendError(res, "Booking not found", 404)

    // If status is approved, update the property
    if (updateData.status === "approved" && updateData.property_id) {
      const propertyUpdates = {}

      // Add booked dates if booking has date information
      if (booking.startDate && booking.endDate) {
        propertyUpdates.$push = {
          bookedDates: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            bookingId: booking._id,
          },
        }
      } else if (booking.date) {
        // If single date
        propertyUpdates.$push = {
          bookedDates: {
            date: booking.date,
            bookingId: booking._id,
          },
        }
      }

      // Add agent to agents array if not already present
      if (updateData.agent_id) {
        propertyUpdates.$addToSet = {
          agents: updateData.agent_id,
        }
      }

      // Update property if there are updates to make
      if (Object.keys(propertyUpdates).length > 0) {
        await Property.findByIdAndUpdate(updateData.property_id, propertyUpdates)
      }
    }

    return sendSuccess(res, "Booking updated successfully", { booking })
  } catch (err) {
    console.error("Error in updateBooking:", err)
    return sendError(res, "Failed to update booking", 500, err.message)
  }
}


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
