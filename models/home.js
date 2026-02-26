const mongoose = require('mongoose');
const homeSchema = mongoose.Schema({
    houseName: {
        type: String,
        required: true
    },
    description: String,

    
    pricePerNight: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    locationName: {
        type: String,
        required: true
    },
    photo: String,
    rating: {
        type: Number,
        required: true
    }
});
module.exports = mongoose.model('Home', homeSchema);