// eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');
const { calculateDate } = require('../utils/utils');
const mongoose = require('mongoose');

// Creating an event
const createEvent = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  const { originalId, title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, notify, notificationTime, customValue, notificationRepeat, notificationType, sharedWith } = req.body;

  try {
    let event;

    let sharedWithUsers = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
    }

    if (originalId !== '') {
      event = new Event({ originalId, title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, user: user._id, notify, notificationTime, sharedWith: sharedWithUsers.map(u => u._id) });
    } else {
      event = new Event({ originalId: new mongoose.Types.ObjectId(), title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, user: user._id, notify, notificationTime, sharedWith: sharedWithUsers.map(u => u._id) });
    }
    const savedEvent = await event.save();

    //populate the sharedWith field with the username of the users
    const populatedEvent = await Event.findById(savedEvent._id).populate('sharedWith', 'username');
    
    // Calculate the date of the notification
    let dateNotif;
    const dateTime = new Date(`${date}T${time}`).toISOString();
    console.log(customValue);
    if (customValue) dateNotif = new Date(customValue).toISOString();
    else dateNotif = calculateDate(dateTime, notificationTime);
    console.log(dateNotif);
    console.log(notificationTime);
    console.log(notificationRepeat);

    // Create a notification if the notify flag is set
    if (notify) await createNotification({ elementId: savedEvent._id, dateNotif, frequencyNotif: notificationRepeat, type: notificationType}, res, true);
    
    console.log(savedEvent);
    res.status(200).json({
      ...populatedEvent.toObject(),
      sharedWith: populatedEvent.sharedWith.map(user => user.username)
    });
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
    const events = await Event.find({
      $or: [
        { user: user._id }, // events created by the user
        { sharedWith: user._id } // events shared with the user
      ]
    })
    .populate('sharedWith', 'username'); // Populates the sharedWith field with the username of the users
    //we only need the username on the frontend
    const eventsWithUsernames = events.map(event => ({
      ...event.toObject(),
      sharedWith: event.sharedWith.map(user => user.username)
    }));
    res.status(200).json(eventsWithUsernames);
  }
  catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, sharedWith } = req.body;
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

     // get the users to share the event with
     let sharedWithUsers = [];
     if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
       sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('username');
     }

    //update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, date, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, sharedWith: sharedWithUsers.map(u => u._id) },
      { new: true }
    ).populate('sharedWith', 'username');

    res.status(200).json({
      ...updatedEvent.toObject(),
      sharedWith: updatedEvent.sharedWith?.map(user => user.username) || []
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update multiple events
const updateMultipleEvent = async (req, res) => {
  const { originalId, userId } = req.params;
  const { title, time, isPreciseTime, duration, allDay, repeatFrequency, repeatEndDate, eventLocation, sharedWith } = req.body;
  try {
    const events = await Event.find({ originalId });
    if (!events) {
      return res.status(404).json({ message: "Events not found" });
    }
    let sharedWithUsers = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
    }

    // update the events
    await Event.updateMany(
      { originalId, userId },
      {
        $set: {
          title,
          time,
          isPreciseTime,
          duration,
          allDay,
          repeatFrequency,
          repeatEndDate,
          eventLocation,
          sharedWith: sharedWithUsers.map((u) => u._id),
        },
      }
    );

    // populate the sharedWith field with the username of the users
    const populatedEvents = await Event.find({ originalId }).populate('sharedWith', 'username');

    res.status(200).json({ message: "Events updated", updatedEvents: populatedEvents.map(event => ({
      ...event.toObject(),
      sharedWith: event.sharedWith?.map(user => user.username) || []
    }))
    });
  }
  catch (error) {
    console.error('Error updating events:', error);
    res.status(500).json({ message: error.message });
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
    res.status(200).json({ message: "Events deleted", deletedEvents: events });
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
    updateMultipleEvent,
    deleteEvent,
    deleteMultipleEvent,
};