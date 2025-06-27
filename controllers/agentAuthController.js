// controllers/authController.js
const User = require('../models/agent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.signup = async (req, res) => {
    const { name, email, password,phone,image,address } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return sendError(res, 'Agent already exists', 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword,image,address,phone });
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
