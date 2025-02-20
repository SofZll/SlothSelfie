const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true 
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    
    subphases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subphase"
    }],

    activities: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity" 
    }] // activities that are not inside subphases

});

const Phase = mongoose.model("Phase", phaseSchema);

module.exports = Phase;