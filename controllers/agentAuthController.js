// controllers/authController.js
const User = require('../models/agent');
const Booking = require('../models/booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.signup = async (req, res) => {
    const { name, email, password, phone, image, address } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return sendError(res, 'Agent already exists', 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, image, address, phone });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        const userWithToken = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            image: user?.image,
            token
        };

        return sendSuccess(res, 'Agent registered successfully', { user: userWithToken }, 200);
    } catch (err) {
        return sendError(res, 'Signup failed', 500, err.message);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return sendError(res, 'Invalid email or password', 400);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return sendError(res, 'Invalid email or password', 400);

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        const userWithToken = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user?.image,
            token
        };

        return sendSuccess(res, 'Login successful', { user: userWithToken });
    } catch (err) {
        return sendError(res, 'Login failed', 500, err.message);
    }
};
exports.getAgents = async (req, res) => {
    try {
        // Query params
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { purpose: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(query);
        const agents = await User.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return sendSuccess(res, 'Agents fetched successfully', {
            agents,
            count: total,


        });
    } catch (err) {
        return sendError(res, 'Failed to fetch agents', 500, err.message);
    }
};

exports.deleteAgent = async (req, res) => {
  try {
    // Step 1: Delete the agent
    const agent = await User.findByIdAndDelete(req.params.id);
    if (!agent) return sendError(res, 'Agent not found', 404);

    // Step 2: Delete all bookings associated with this agent
    await Booking.deleteMany({ agent_id: agent._id.toString() });

    return sendSuccess(res, 'Agent and related bookings deleted successfully');
  } catch (err) {
    console.error("Error deleting agent and their bookings:", err);
    return sendError(res, 'Failed to delete agent and their bookings', 500, err.message);
  }
};


exports.getAgentById = async (req, res) => {
    try {
        const agent = await User.findById(req.params.id);
        if (!agent) return sendError(res, 'agent not found', 404);
        return sendSuccess(res, 'Agent fetched successfully', { agent });
    } catch (err) {
        return sendError(res, 'Failed to fetch agent', 500, err.message);
    }
};
