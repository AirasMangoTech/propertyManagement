const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
} = require('../controllers/bookingController');

router.post('/booking/create', createBooking);
router.get('/getbookings', getBookings);
router.get('/getbooking/:id', getBookingById);
router.patch('/updatebooking',auth, updateBooking);
router.delete('/deletebooking/:id',auth, deleteBooking);

module.exports = router;
