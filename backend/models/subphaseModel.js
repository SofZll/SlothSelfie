const mongoose = require("mongoose");

const subphaseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true 
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },

    phase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phase',
    },
    
    activities: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity" 
    }] // activities that are inside subphases
    
});

const Subphase = mongoose.model("Subphase", subphaseSchema);

module.exports = Subphase;