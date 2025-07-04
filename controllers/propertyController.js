const Property = require('../models/property');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

exports.createProperty = async (req, res) => {
    try {
        const property = new Property(req.body);
        await property.save();
        return sendSuccess(res, 'Property created successfully', { property }, 200);
    } catch (err) {
        return sendError(res, 'Something went wrong while creating the property', 500, err.message);
    }
};

exports.getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', start_price, end_price, type, purpose } = req.query;

        // Build query with search
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

        // Apply price filters
        if (start_price || end_price) {
            query.price = {};
            if (start_price) query.price.$gte = parseFloat(start_price);
            if (end_price) query.price.$lte = parseFloat(end_price);
        }

        // Add type and purpose filters outside price condition
        if (type) query.type = type;
        if (purpose) query.purpose = purpose;



        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get all matched properties (no skip/limit) for min/max calculation
        const matchedProperties = await Property.find(query).select('price');
        const allProperties = await Property.find().select('price');
        const total = matchedProperties.length;

        const min_price = allProperties.length > 0
            ? Math.min(...allProperties.map(p => p.price))
            : 0;

        const max_price = allProperties.length > 0
            ? Math.max(...allProperties.map(p => p.price))
            : 0;

        // Paginated results
        console.log(query)
        const properties = await Property.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return sendSuccess(res, 'Properties fetched successfully', {
            properties,
            count: total,
            min_price,
            max_price
        });
    } catch (err) {
        return sendError(res, 'Failed to fetch properties', 500, err.message);
    }
};




exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return sendError(res, 'Property not found', 404);
        return sendSuccess(res, 'Property fetched successfully', { property });
    } catch (err) {
        return sendError(res, 'Failed to fetch property', 500, err.message);
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;

        if (!id) return sendError(res, 'Property ID is required in body', 400);

        const property = await Property.findByIdAndUpdate(id, updateData, { new: true });

        if (!property) return sendError(res, 'Property not found', 404);

        return sendSuccess(res, 'Property updated successfully', { property });
    } catch (err) {
        return sendError(res, 'Failed to update property', 500, err.message);
    }
};


exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) return sendError(res, 'Property not found', 404);
        return sendSuccess(res, 'Property deleted successfully');
    } catch (err) {
        return sendError(res, 'Failed to delete property', 500, err.message);
    }
};
