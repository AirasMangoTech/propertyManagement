const Booking = require('../models/booking');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

exports.createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        return sendSuccess(res, 'Booking created successfully', { booking }, 200);
    } catch (err) {
        return sendError(res, 'Something went wrong while creating the booking', 500, err.message);
    }
};

exports.getBookings = async (req, res) => {
    try {
        // Query params
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { purpose: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Booking.countDocuments(query);
        const properties = await Booking.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return sendSuccess(res, 'Properties fetched successfully', {
            properties,
            count: total,


        });
    } catch (err) {
        return sendError(res, 'Failed to fetch properties', 500, err.message);
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
