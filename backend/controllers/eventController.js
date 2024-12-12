// eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');

// Creating an event
const createEvent = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  const { originalId, title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, EventLocation, sharedWith } = req.body;

  try {
    let event;

    let sharedWithUsers = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      sharedWithUsers = await User.find({ username: { $in: sharedWith } });
    }

    if (originalId !== '') {
      event = new Event({ originalId, title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, EventLocation, user: user._id, sharedWith: sharedWithUsers.map(u => u._id) });
    } else {
      event = new Event({ originalId: user._id, title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, EventLocation, user: user._id, sharedWith: sharedWithUsers.map(u => u._id) });
    }
    const savedEvent = await event.save();
    res.status(200).json(savedEvent);
  }
  catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
};

// fetch all events
const getEvents = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });

  try {
    const events = await Event.find({ user: user._id });
    res.status(200).json(events);
  }
  catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, EventLocation } = req.body;
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  try {
    const event = await Event.findById(eventId);
    if (!event){
      return res.status(404).json({ message: 'Evento non trovato' });
    }
    if (event.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Non sei autorizzato a modificare questo evento' });
    }

    //update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, EventLocation },
      { new: true }
    );
    res.status(200).json(updatedEvent);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
    const {eventId} = req.params;
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      await Event.findByIdAndDelete(eventId);
      res.status(200).json({ message: "Event deleted" });
    }
    catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: error.message });
    }
};

// Delete multiple events
const deleteMultipleEvent = async (req, res) => {
  const { originalId } = req.params;
  try {
    const events = await Event.find({ originalId });
    if (!events) {
      return res.status(404).json({ message: "Events not found" });
    }
    await Event.deleteMany({ originalId });
    res.status(200).json({ message: "Events deleted" });
  }
  catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    deleteMultipleEvent
};