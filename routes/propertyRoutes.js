const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');

router.post('/property/create',auth, createProperty);
router.get('/getproperties', getProperties);
router.get('/getproperty/:id', getPropertyById);
router.patch('/updateproperty',auth, updateProperty);
router.delete('/deleteproperty/:id',auth, deleteProperty);

module.exports = router;
