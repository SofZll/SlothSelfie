// eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const { findUserId } = require('../utils/utils');
const { sendExportEmail } = require('../utils/utils');
const { createEvent } = require('ics'); // Import the library for iCalendar generation

const ical = require('node-ical');
const fs = require('fs');


const getEvents = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });

  try {

    if (!user) return res.status(404).json({ message: 'User not found' });

    const events = await Event.find({
      $or: [
        { user: user._id },
        { sharedWith: user._id }
      ]
    }).populate('sharedWith', 'username')
    .populate('user', 'username');


    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const newEvent = async (title, user, type, startDate, endDate, allDay, eventLocation, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId) => {

  try {
    if (!user) return ({ success: false, message: 'User not found' });

    const listSameDate = await Event.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ],
      user: user._id
    });

    if (listSameDate.length > 0) return ({ success: false, message: 'Event already exists in this time slot' });

    const newEvent = new Event({
      title,
      user: user._id,
      sharedWith,
      startDate,
      endDate,
      allDay,
      type,
      repeatFrequency,
      isInProject,
    });

    if (eventLocation) newEvent.eventLocation = eventLocation;

    if (repeatFrequency !== 'none') {
      if (fatherId) newEvent.fatherId = fatherId;

      if (repeatEndDate) newEvent.repeatEndDate = repeatEndDate;
      else if (repeatTimes) newEvent.repeatTimes = repeatTimes;
      else return ({ success: false, message: 'Repeat frequency is set but no end date or number of occurrences provided' });
    }

    saveEvent = await newEvent.save();

    if (repeatFrequency !== 'none' && !fatherId) {
      const events = await Event.findById(saveEvent._id);
      events.fatherId = saveEvent._id;
      await events.save();
    }

    const event = await Event.findById(saveEvent._id)
    .populate('sharedWith', 'username')
    .populate('user', 'username');

    return ({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return ({ success: false, message: error.message });
  }
}

const createNewEvent = async (req, res) => {
  const userName = req.session.username;
  const { title, type, startDate, endDate, allDay, repeatFrequency, repeatEndDate, repeatTimes, eventLocation, sharedWith, isInProject} = req.body;

  try {
    const user = await User.findOne({ username: userName });
    const users = await findUserId(sharedWith);

    if (repeatFrequency === 'none') {
      const event = await newEvent(title, user, type, startDate, endDate, allDay, eventLocation, users, isInProject, repeatFrequency);
      if (event.success) {
        res.status(201).json({ success: true, event: event.event });
      } else {
        res.status(400).json({ success: false, message: event.message });
      }
    } else {

      let gap = 1;
      const events = [];
      let fatherId = null;

      if (repeatFrequency === 'weekly') gap = 7;
      else if (repeatFrequency === 'monthly') gap = 30;
      else if (repeatFrequency === 'yearly') gap = 365;
      
      if (repeatTimes) {
        for (let i = 0; i < repeatTimes; i++) {
          const newStartDate = new Date(startDate);
          const newEndDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + (i * gap));
          newEndDate.setDate(newEndDate.getDate() + (i * gap));

          const event = await newEvent(title, user, type, newStartDate, newEndDate, allDay, eventLocation, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
          if (event.success) events.push(event.event);
          else {
            res.status(400).json({ success: false, message: event.message });
            return;
          }

          if (i === 0) {
            fatherId = event.event._id;
          }
        }
      } else if (repeatEndDate) {
        const endDate = new Date(repeatEndDate);
        let i = 0;
        while (startDate <= endDate) {
          const newStartDate = new Date(startDate);
          const newEndDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + (i * gap));
          newEndDate.setDate(newEndDate.getDate() + (i * gap));

          const event = await newEvent(title, user, type, newStartDate, newEndDate, allDay, eventLocation, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
          if (event.success) events.push(event.event);
          else {
            res.status(400).json({ success: false, message: event.message });
            return;
          }

          if (i === 0) {
            fatherId = event.event._id;
          }
          i++;
        }
      } else {
        res.status(400).json({ success: false, message: 'Repeat frequency is set but no end date or number of occurrences provided' });
        return;
      }

      res.status(201).json({ success: true, events });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const editEvent = async (Id, title, type, startDate, endDate, allDay, eventLocation, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes) => {

  try {
    const event = await Event.findById(Id);
    if (!event) return ({ success: false, message: 'Event not found' });

    event.title = title;
    event.type = type;
    event.startDate = startDate;
    event.endDate = endDate;
    event.allDay = allDay;
    event.eventLocation = eventLocation;
    event.sharedWith = sharedWith;
    event.isInProject = isInProject;
    event.repeatFrequency = repeatFrequency;
    event.repeatEndDate = repeatEndDate;
    event.repeatTimes = repeatTimes;

    if (repeatFrequency === 'none') event.fatherId = null;
    else event.fatherId = event.fatherId || event._id;

    await event.save();
    return ({ success: true, event });
  } catch (error) {
    console.error('Error editing event:', error);
    return ({ success: false, message: error.message });
  }
}

// Update an event
const updateEvent = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  const { eventId } = req.params;
  const { title, type, startDate, endDate, allDay, eventLocation, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes } = req.body;

  try {
    const users = await findUserId(sharedWith);
    
    if (repeatFrequency === 'none') {
      const event = await editEvent(eventId, title, type, startDate, endDate, allDay, eventLocation, users, isInProject, repeatFrequency);
      if (event.success) {
        res.status(200).json({ success: true, event: event.event });
      } else {
        res.status(400).json({ success: false, message: event.message });
      }
    } else {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      let gap = 1;
      if (repeatFrequency === 'weekly') gap = 7;
      else if (repeatFrequency === 'monthly') gap = 30;
      else if (repeatFrequency === 'yearly') gap = 365;

      const events = [];
      let fatherId = event.fatherId || event._id;
      
      events2edit = await Event.find({ fatherId: fatherId });

      if (repeatTimes) {
        for (let i = 0; i < events2edit.length; i++) {
          const newStartDate = new Date(startDate);
          const newEndDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + (i * gap));
          newEndDate.setDate(newEndDate.getDate() + (i * gap));

          const event = await editEvent(events2edit[i]._id, title, type, newStartDate, newEndDate, allDay, eventLocation, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes);
          if (event.success) events.push(event.event);
          else {
            res.status(400).json({ success: false, message: event.message });
            return;
          }
        }

        if (events2edit.length < repeatTimes) {
          for (let i = events2edit.length; i < repeatTimes; i++) {
            const newStartDate = new Date(startDate);
            const newEndDate = new Date(endDate);
            newStartDate.setDate(newStartDate.getDate() + (i * gap));
            newEndDate.setDate(newEndDate.getDate() + (i * gap));

            const event = await newEvent(title, user, type, newStartDate, newEndDate, allDay, eventLocation, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
            if (event.success) events.push(event.event);
            else {
              res.status(400).json({ success: false, message: event.message });
              return;
            }
          }
        } else if (events2edit.length > repeatTimes) {
          for (let i = repeatTimes; i < events2edit.length; i++) {
            await Event.findByIdAndDelete(events2edit[i]._id);
          }
        }
      } else if (repeatEndDate) {
        const endDate = new Date(repeatEndDate);
        let i = 0;
        while (startDate <= endDate) {
          const newStartDate = new Date(startDate);
          const newEndDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + (i * gap));
          newEndDate.setDate(newEndDate.getDate() + (i * gap));

          const event = await editEvent(events2edit[i]._id, title, type, newStartDate, newEndDate, allDay, eventLocation, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes);
          if (event.success) events.push(event.event);
          else {
            res.status(400).json({ success: false, message: event.message });
            return;
          }
          i++;
        }


      }
    }
      

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });
  const {eventId} = req.params;
  
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (event.user.toString() === user._id.toString()) {
      if (event.repeatFrequency === 'none') await event.deleteOne();
      else await Event.deleteMany({ fatherId: event.fatherId });
    } else {
      if (event.repeatFrequency === 'none') {
        event.sharedWith = event.sharedWith.filter(sharedUser => sharedUser.toString() !== user._id.toString());
        await event.save();
      } else {
        const events = await Event.find({ fatherId: event.fatherId });
        for (let i = 0; i < events.length; i++) {
          events[i].sharedWith = events[i].sharedWith.filter(sharedUser => sharedUser.toString() !== user._id.toString());
          await events[i].save();
        }
      }
    }

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: error.message });
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

      if (event.repeatTimes && event.repeatTimes > 0) {
        recurrenceRule += `COUNT=${event.repeatTimes};`;
      } else if (event.repeatEndDate) {
        const endRecDate = event.repeatEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        recurrenceRule += `UNTIL=${endRecDate}`;
      }
    }

    const { error, value } = createEvent({
      title: event.title,
      description: '',
      location: event.eventLocation || 'physical',
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
    const files = req.files;

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
          const commonOriginalId = new mongoose.Types.ObjectId();  // Create the originalId for the event one time

          // Check if the event has a recurrence rule (rrule)
          if (icsEvent.rrule) {
            const rule = icsEvent.rrule;
            const startDate = new Date(icsEvent.start);
      
            // Create a new event for each occurrence of the recurring event
            const dates = rule.allBetween(startDate, rule.options.until || new Date('2100-01-01'), true); 
            // true = inclusivo
      
            for (const date of dates) {
              const newEvent = new Event({
                title: icsEvent.summary || 'Untitled Event',
                startDate: new Date(date),
                endDate: new Date(date.getTime() + (icsEvent.end - icsEvent.start)), //duration is the same for all occurrences
                allDay: !date.getHours(),
                repeatFrequency: rule.options.freq.toLowerCase(),
                repeatEndDate: rule.options.until || null,
                repeatTimes: rule.options.count || 0,
                eventLocation: icsEvent.location || 'physical',
                user: user._id,
                originalId: commonOriginalId,  // Use the same originalId for all occurrences
              });
              await newEvent.save();
              importedEvents.push(newEvent);

              console.log('Imported recurring event:', newEvent);  // Log the imported event for debugging
            }
      
          } else {
            // If it's not a recurring event, just create a single event
            const newEvent = new Event({
              title: icsEvent.summary || 'Untitled Event',
              startDate: new Date(icsEvent.start),
              endDate: new Date(icsEvent.end),
              allDay: !icsEvent.start.getHours(),
              repeatFrequency: 'none',
              repeatEndDate: null,
              repeatTimes: 0,
              eventLocation: icsEvent.location || 'physical',
              user: user._id,
              originalId: commonOriginalId,
            });
            await newEvent.save();
            importedEvents.push(newEvent);

            console.log('Imported single event:', newEvent);  // Log the imported event for debugging
          }

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
  getEvents,
  createNewEvent,
  updateEvent,
  deleteEvent,
  exportEvent,
  importEvents
};