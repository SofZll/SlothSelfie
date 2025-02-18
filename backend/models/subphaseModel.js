const mongoose = require("mongoose");

const subphaseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true 
    },

    activities: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity" 
    }] // activities that are inside subphases
    
});

const Subphase = mongoose.model("Phase", subphaseSchema);

module.exports = Subphase;