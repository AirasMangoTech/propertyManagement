// controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return sendError(res, 'User already exists', 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        const userWithToken = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        };

        return sendSuccess(res, 'User registered successfully', { user: userWithToken }, 200);
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
            token
        };

        return sendSuccess(res, 'Login successful', { user: userWithToken });
    } catch (err) {
        return sendError(res, 'Login failed', 500, err.message);
    }
};

exports.getInvestors = async (req, res) => {
    try {
        // Query params
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            role: 'investor', // ✅ Only fetch users with role = 'investor'
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
        const total = await User.countDocuments(query);
        const properties = await User.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return sendSuccess(res, 'Investors fetched successfully', {
            properties,
            count: total,
        });
    } catch (err) {
        return sendError(res, 'Failed to fetch investors', 500, err.message);
    }
};
exports.deleteInvestor = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return sendError(res, 'investor not found', 404);
        return sendSuccess(res, 'investor deleted successfully');
    } catch (err) {
        return sendError(res, 'Failed to delete investor', 500, err.message);
    }
};

exports.getInvestorById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return sendError(res, 'investor not found', 404);
        return sendSuccess(res, 'investor fetched successfully', { user });
    } catch (err) {
        return sendError(res, 'Failed to fetch investor', 500, err.message);
    }
};