const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: true 
    },

    description: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },

    owner: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User",
          required: true 
    },

    members: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User"
    }],

    phases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PhaseSubphase"
        //ref: "Phase"
    }],

    createdAt: {
        type: Date,
        default: Date.now 
    },

    updatedAt: {
        type: Date, 
        default: Date.now 
    }
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;