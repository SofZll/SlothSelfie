// eventController.js
const Event = require('../models/eventModel');

// Creating an event
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// fetch all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.session.userId }); // filtering events by user
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Evento non trovato' });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Evento non trovato' });
    res.status(200).json({ message: 'Evento eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
};