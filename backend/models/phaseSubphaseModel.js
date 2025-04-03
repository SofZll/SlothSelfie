const mongoose = require("mongoose");

const phaseSubphaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true 
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },

    type: { // 'phase' o 'subphase'
        type: String,
        required: true,
        enum: ['phase', 'subphase'], // it can either be a phase or a subphase
    },

    parentPhase: { // if it is a subphase, this field will contain the id of the parent phase
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhaseSubphase',
    },

    subphases: [{ // if it is a phase, this field will contain the subphases of the phase
            type: mongoose.Schema.Types.ObjectId,
            ref: "PhaseSubphase"
        }],

    activities: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity"
    }] // activities that are inside phase/subphase

});

const PhaseSubphase = mongoose.model("PhaseSubphase", phaseSubphaseSchema);

module.exports = PhaseSubphase;