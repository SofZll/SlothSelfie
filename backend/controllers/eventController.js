// eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');
const { calculateDate } = require('../utils/utils');
const {sendExportEmail} = require('../utils/utils');
const mongoose = require('mongoose');
const { createEvent } = require('ics'); // Import the library for iCalendar generation

const ical = require('node-ical');
const fs = require('fs');
const path = require('path');

//const Activity = require('../models/activityModel');  //TEST

// Creating an event
const createNewEvent = async (req, res) => {
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
    res.status(200).json({ success: true, eventsWithUsernames });
  }
  catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
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

//Function to export events on iCalendar (using library: ics.js)
//TODO: TESTARE E MODIFICARE SE NECESSARIO (quando avremo modello event definitivo)
async function exportEvent(req, res){
  try {
      const {eventId} = req.params;
      const userName = req.session.username;
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }

      const user = await User.findOne({ username: userName });
      
      // Build the start/end array
      const start = event.allDay
      ? [
          event.startDate.getFullYear(),
          event.startDate.getMonth() + 1,
          event.startDate.getDate(),
        ]
      : [
          event.startDate.getFullYear(),
          event.startDate.getMonth() + 1,
          event.startDate.getDate(),
          event.startDate.getHours(),
          event.startDate.getMinutes(),
        ];

    const end = event.allDay
      ? [
          event.endDate.getFullYear(),
          event.endDate.getMonth() + 1,
          event.endDate.getDate(),
        ]
      : [
          event.endDate.getFullYear(),
          event.endDate.getMonth() + 1,
          event.endDate.getDate(),
          event.endDate.getHours(),
          event.endDate.getMinutes(),
        ];

    // Build the recurrence rule if needed
    let recurrenceRule;
    if (event.repeatFrequency && event.repeatFrequency !== 'none') {
      const freqMap = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
      };

      recurrenceRule = `FREQ=${freqMap[event.repeatFrequency]};`;
      if (event.repeatEndDate) {
        const endRecDate = event.repeatEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        recurrenceRule += `UNTIL=${endRecDate}`;
      }
    }

    const { error, value } = createEvent({
      title: event.title,
      description: '',
      location: event.eventLocation || '',
      start,
      end,
      recurrenceRule,
    });
    
      if (error) {
          console.error("ICS generation error:", error);
          return res.status(500).json({ message: 'Error while generating .ics' });
      }

      console.log("Generated .ics value:\n", value);
      
      // send the mail with the .ics file as attachment to the user
      const userEmail = user.email;
      
      await sendExportEmail(
          userEmail,
          `${event.title}.ics`,
          value
      );
          
      //download the file on frontend
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="${event.title}.ics"`);
      res.status(200).send(value);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error during the event export' });
    }
}

// Import events from ICS file
//TODO: TESTARE E MODIFICARE SE NECESSARIO (quando avremo modello event definitivo) controlla gestione di eventi ripetuti
const importEvents = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  try {
    const files = req.files

    console.log('Files received:', req.files);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const importedEvents = [];

    for (const file of files) {
        const filePath = file.path;  // Path to the file
        const data = ical.parseFile(filePath);  // Parsing file .ics
        console.log('Parsed data:', data);  // Log the parsed data for debugging

      for (const key in data) {
        const icsEvent = data[key];
        if (icsEvent.type === 'VEVENT') {
          const newEvent = new Event({
            title: icsEvent.summary || 'Untitled Event',
            startDate: new Date(icsEvent.start),
            endDate: new Date(icsEvent.end),
            allDay: !icsEvent.start.getHours(),
            repeatFrequency: icsEvent.rrule ? icsEvent.rrule.options.freq.toLowerCase() : 'none',
            repeatEndDate: icsEvent.rrule?.options?.until || null,
            eventLocation: icsEvent.location || '',
            user: user._id,
            originalId: new mongoose.Types.ObjectId(),
          });
          await newEvent.save();
          importedEvents.push(newEvent);

          //try with activity model   IT WORKS!
         
          /*const newActivity = new Activity({
            title: icsEvent.summary || 'Untitled Event',
            deadline: new Date(icsEvent.start),
            allDay: !icsEvent.start.getHours(),
            user: user._id,
          });
          await newActivity.save();
          importedEvents.push(newActivity);*/

        }
      }

      fs.unlinkSync(file.path); // delete the file after parsing
    }

    res.status(200).json({ message: 'Import OK', importedEvents });

  } catch (error) {
    console.error('Error importing event:', error);
    res.status(500).json({ message: 'Import error', error });
  }
};

module.exports = {
    createNewEvent,
    getEvents,
    updateEvent,
    updateMultipleEvent,
    deleteEvent,
    deleteMultipleEvent,
    exportEvent,
    importEvents
};