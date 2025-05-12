// eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const { findUserId } = require('../utils/utils');
const { sendExportEmail } = require('../utils/utils');
const { createEvent } = require('ics'); // owImport the library for iCalendar generation
const { getCurrentNow } = require('../services/timeMachineService');

const ical = require('node-ical');
const fs = require('fs');
const { RRule } = require('rrule');
const { find } = require('../models/noAvailabilityModel');


const getEvents = async (req, res) => {
  const now = getCurrentNow();
  const userName = req.session.username;
  const user = await User.findOne({ username: userName });

  try {

    if (!user) return res.status(404).json({ message: 'User not found' });

    const events = await Event.find({
      $or: [
        { user: user._id },
        { sharedWith: user._id }
      ],
      createdAt: { $lte: now }
    }).populate('sharedWith', 'username')
    .populate('user', 'username')
    .lean();

    console.log('Fetched events:', events); // Log the fetched events for debugging

    const transformedEvents = events.map(event => {
      return {
        ...event,
        sharedWith: event.sharedWith.map(user => user.username),
      }
    });

    res.status(200).json({ success: true, events: transformedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const newEvent = async (title, user, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId) => {

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
      priority,
      repeatFrequency,
      isInProject,
      createdAt: getCurrentNow(),
      updatedAt: getCurrentNow()
    });

    if (eventLocation) newEvent.eventLocation = eventLocation;
    if (eventLocationDetails) newEvent.eventLocationDetails = eventLocationDetails;

    if (repeatFrequency !== 'none') {
      if (fatherId) newEvent.fatherId = fatherId;

      if (repeatEndDate) newEvent.repeatEndDate = repeatEndDate;
      else if (repeatTimes) newEvent.repeatTimes = repeatTimes;
      else return ({ success: false, message: 'Repeat frequency is set but no end date or number of occurrences provided' });
    }

    saveEvent = await newEvent.save();

    if (repeatFrequency !== 'none' && !fatherId) {
      const event = await Event.findById(saveEvent._id);
      event.fatherId = saveEvent._id;
      await event.save();
    }

    const event = await Event.findById(saveEvent._id)
    .populate('sharedWith', 'username')
    .populate('user', 'username')
    .lean();

    const transformedEvent = {
      ...event,
      sharedWith: event.sharedWith.map(user => user.username),
    };

    return ({ success: true, event: transformedEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return ({ success: false, message: error.message });
  }
}

const createNewEvent = async (req, res) => {
  const userName = req.session.username;
  const { title, type, priority, startDate, endDate, allDay, repeatFrequency, repeatEndDate, repeatTimes, eventLocation, eventLocationDetails, sharedWith, isInProject} = req.body;

  try {
    const user = await User.findOne({ username: userName });
    const users = await findUserId(sharedWith);

    if (repeatFrequency === 'none') {
      const event = await newEvent(title, user, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency);
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

          const event = await newEvent(title, user, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
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
        let i = 0;
        while (new Date(startDate).setDate(new Date(startDate).getDate() + (i * gap)) <= new Date(repeatEndDate)) {
          const newStartDate = new Date(startDate);
          const newEndDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + (i * gap));
          newEndDate.setDate(newEndDate.getDate() + (i * gap));

          const event = await newEvent(title, user, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
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

const editEvent = async (Id, title, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId) => {

  try {
    const event = await Event.findById(Id);
    if (!event) return ({ success: false, message: 'Event not found' });

    const listSameDate = await Event.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ],
      user: event.user,
      _id: { $ne: Id },
      fatherId: { $ne: event.fatherId }
    });

    if (listSameDate.length > 0) return ({ success: false, message: 'Event already exists in this time slot' });

    event.title = title;
    event.type = type;
    event.priority = priority;
    event.startDate = startDate;
    event.endDate = endDate;
    event.allDay = allDay;
    event.eventLocation = eventLocation;
    event.eventLocationDetails = eventLocationDetails;
    event.sharedWith = sharedWith;
    event.isInProject = isInProject;
    event.repeatFrequency = repeatFrequency;
    event.repeatEndDate = repeatEndDate;
    event.repeatTimes = repeatTimes;
    event.updatedAt = getCurrentNow();

    if (repeatFrequency === 'none') event.fatherId = null;
    else event.fatherId = fatherId;

    await event.save()

    const savedEvent = await Event.findById(Id)
    .populate('sharedWith', 'username')
    .populate('user', 'username')
    .lean();

    const transformedEvent = {
      ...savedEvent,
      sharedWith: savedEvent.sharedWith.map(user => user.username),
    };

    return ({ success: true, event: transformedEvent });
  } catch (error) {
    console.error('Error editing event:', error);
    return ({ success: false, message: error.message });
  }
}

const updateNoDateEvent = async (Id, title, type, priority, eventLocation, sharedWith, isInProject) => {
  try {
    const event = await Event.findById(Id);
    if (!event) return ({ success: false, message: 'Event not found' });

    event.title = title;
    event.type = type;
    event.priority = priority;
    event.eventLocation = eventLocation;
    event.sharedWith = sharedWith;
    event.isInProject = isInProject;
    event.updatedAt = getCurrentNow();
    
    await event.save();

    const savedEvent = await Event.findById(Id)
    .populate('sharedWith', 'username')
    .populate('user', 'username')
    .lean();

    const transformedEvent = {
      ...savedEvent,
      sharedWith: savedEvent.sharedWith.map(user => user.username),
    };

    return ({ success: true, event: transformedEvent });
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

  const { title, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, sharedWith, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId } = req.body;


  try {
    const users = await findUserId(sharedWith);
    
    if (repeatFrequency === 'none') {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      else {
        if (event.repeatFrequency !== 'none') {
          const events = await Event.find({ fatherId: event.fatherId });
          for (let i = 1; i < events.length; i++) {
            await Event.findByIdAndDelete(events[i]._id);
          }

          const response = await editEvent(events[0]._id, title, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency);
          if (response.success) {
            res.status(200).json({ success: true, event: response.event });
            return;
          } else {
            res.status(400).json({ success: false, message: response.message });
            return;
          }
        }
      }
    
      const response = await editEvent(eventId, title, type, priority, startDate, endDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency);
      if (response.success) {
        res.status(200).json({ success: true, event: response.event });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } else {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      const events = [];

      if (new Date(event.startDate).getTime() === new Date(startDate).getTime() && new Date(event.endDate).getTime() === new Date(endDate).getTime() && event.allDay === allDay && event.repeatFrequency === repeatFrequency && new Date(event.repeatEndDate).getTime() === new Date(repeatEndDate).getTime() && event.repeatTimes === repeatTimes) {

        const events2edit = await Event.find({ fatherId: fatherId });
        if (events2edit.length > 0) {
          for (let i = 0; i < events2edit.length; i++) {
            const response = await updateNoDateEvent(events2edit[i]._id, title, type, priority, eventLocation, eventLocationDetails, users, isInProject);

            if (!response.success) {
              res.status(400).json({ success: false, message: response.message });
              return;
            } else events.push(response.event);
          }
          res.status(200).json({ success: true, events });
        } else return res.status(404).json({ success: false, message: 'No events found to edit' });
      } else {

        let startDateDifference, endDateDifference, additionStartDate, additionEndDate;

        if (event.startDate.getTime() < new Date(startDate).getTime()) {
          startDateDifference = new Date(startDate).getTime() - event.startDate.getTime();
          additionStartDate = true;
        } else if (event.startDate.getTime() === new Date(startDate).getTime()) {
          startDateDifference = 0;
          additionStartDate = false;
        } else {
          startDateDifference = event.startDate.getTime() - new Date(startDate).getTime();
          additionStartDate = false;
        }

        if (event.endDate.getTime() < new Date(endDate).getTime()) {
          endDateDifference = new Date(endDate).getTime() - event.endDate.getTime();
          additionEndDate = true;
        } else if (event.endDate.getTime() === new Date(endDate).getTime()) {
          endDateDifference = 0;
          additionEndDate = false;
        } else {
          endDateDifference = event.endDate.getTime() - new Date(endDate).getTime();
          additionEndDate = false;
        }

        let gap = 1;
        if (repeatFrequency === 'weekly') gap = 7;
        else if (repeatFrequency === 'monthly') gap = 30;
        else if (repeatFrequency === 'yearly') gap = 365;

        let fatherId = event.fatherId || eventId;
        
        const events2edit = await Event.find({
          $or: [
            { _id: eventId },
            { fatherId: fatherId }
          ]
        }).sort({ startDate: 1 });

        if (events2edit.length === 0) return res.status(404).json({ success: false, message: 'No events found to edit' });

    
        if (repeatTimes) {

          for (let i = 0; i < repeatTimes; i++) {
            const newStartDate = new Date(new Date(events2edit[0].startDate).getTime() + (i * gap * 1000 * 60 * 60 * 24) + ( additionStartDate ? + startDateDifference : - startDateDifference));
            const newEndDate = new Date(new Date(events2edit[0].endDate).getTime() + (i * gap * 1000 * 60 * 60 * 24) + ( additionEndDate ? + endDateDifference : - endDateDifference));

            if (i >= events2edit.length) {
              const responseEvent = await newEvent(title, user, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
              if (responseEvent.success) events.push(responseEvent.event);
              else {
                return res.status(400).json({ success: false, message: responseEvent.message });
              }
            } else {
              const response = await editEvent(events2edit[i]._id, title, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
              if (!response.success) {
                res.status(400).json({ success: false, message: response.message });
                return;
              } else events.push(response.event);
            }
          }

          if (repeatTimes < events2edit.length) {
            for (let i = repeatTimes; i < events2edit.length; i++) {
              await Event.findByIdAndDelete(events2edit[i]._id);
            }
          }
        } else if (repeatEndDate) {
          let count = 0;
          let newStartDate = new Date(new Date(events2edit[0].startDate).getTime() + ( additionStartDate ? + startDateDifference : - startDateDifference));
          let newEndDate = new Date(new Date(events2edit[0].endDate).getTime() + ( additionEndDate ? + endDateDifference : - startDateDifference));
          while (newStartDate <= (new Date(repeatEndDate).setHours(23, 59, 59, 999))) {

            if (count >= events2edit.length) {
              const responseEvent = await newEvent(title, user, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
              if (responseEvent.success) events.push(responseEvent.event);
              else return res.status(400).json({ success: false, message: responseEvent.message });

            } else {
              const response = await editEvent(events2edit[count]._id, title, type, priority, newStartDate, newEndDate, allDay, eventLocation, eventLocationDetails, users, isInProject, repeatFrequency, repeatEndDate, repeatTimes, fatherId);
              if (!response.success) {
                res.status(400).json({ success: false, message: response.message });
                return;
              } else events.push(response.event);
            }
            count++;
            newStartDate = new Date(new Date(events2edit[0].startDate).getTime() + (count * gap * 1000 * 60 * 60 * 24) + ( additionStartDate ? + startDateDifference : - startDateDifference));
            newEndDate = new Date(new Date(events2edit[0].endDate).getTime() + (count * gap * 1000 * 60 * 60 * 24) + ( additionEndDate ? + endDateDifference : - endDateDifference));
          }

          if (count < events2edit.length) {
            for (let i = count; i < events2edit.length; i++) {
              await Event.findByIdAndDelete(events2edit[i]._id);
            }
          }
        } else {
          res.status(400).json({ success: false, message: 'Repeat frequency is set but no end date or number of occurrences provided' });
          return;
        }
        res.status(200).json({ success: true, events });
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
    const event = await Event.findById(eventId)
    .populate({
      path: 'sharedWith',
      select: 'isRoom isDevice'
    })
    .lean();
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (event.user.toString() === user._id.toString()) {
      if (event.repeatFrequency === 'none') await Event.findByIdAndDelete(eventId);
      else await Event.deleteMany({ fatherId: event.fatherId });


    } else if (user.isAdmin) {
      if (event.repeatFrequency === 'none') {
        const sharedUsers = event.sharedWith.filter(sharedUser => !sharedUser.isRoom && !sharedUser.isDevice).map(sharedUser => sharedUser._id);
        await Event.findByIdAndUpdate(eventId, { sharedWith: sharedUsers}, { new: true });
      } else {
        const events = await Event.find({ fatherId: event.fatherId })
        .populate({
          path: 'sharedWith',
          select: 'isRoom isDevice'
        })
        .lean();

        for (let i = 0; i < events.length; i++) {
          const sharedUsers = events[i].sharedWith.filter(sharedUser => !sharedUser.isRoom && !sharedUser.isDevice).map(sharedUser => sharedUser._id);
          await Event.findByIdAndUpdate(events[i]._id, { sharedWith: sharedUsers}, { new: true });
        }
      }
    
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
async function exportEvent(req, res){
  try {
      const {eventId} = req.params;
      const userName = req.session.username;
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }

      const user = await User.findOne({ username: userName });

      //For the allDay events, we need to add +1 day to the end date in order to have the correct date in the .ics file
      const adjustedEnd = event.allDay
      ? new Date(event.endDate.getTime() + 24 * 60 * 60 * 1000) // +1 giorno
      : event.endDate;
      
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
          adjustedEnd.getFullYear(),
          adjustedEnd.getMonth() + 1,
          adjustedEnd.getDate(),
        ]
      : [
          adjustedEnd.getFullYear(),
          adjustedEnd.getMonth() + 1,
          adjustedEnd.getDate(),
          adjustedEnd.getHours(),
          adjustedEnd.getMinutes(),
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
        // Set the count of all the occurrences 
        const occurrences = await Event.find({ fatherId: event.fatherId });
        //compare the dates of the occurrences with the start date of the event, if it is before the start date, we remove it from the count
        const occurrencesCount = occurrences.filter(occurrence => occurrence.startDate >= event.startDate).length;
        recurrenceRule += `COUNT=${occurrencesCount}`;
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
          // Check if the event is all-day
          const isAllDay = icsEvent.datetype === 'date' || 
                 (icsEvent.start && icsEvent.start.params && icsEvent.start.params.VALUE === 'DATE');
          
          //Correct end date for all-day events interpreted as exclusive by other apps (e.g. Outlook)
          const correctedEnd = isAllDay
            ? new Date(icsEvent.end.getTime() - 24 * 60 * 60 * 1000)
            : new Date(icsEvent.end);

          // Check if the event has a recurrence rule (rrule)
          if (icsEvent.rrule) {
            const rule = new RRule({
              ...icsEvent.rrule.origOptions,
              tzid: undefined  // Remove timezone information to avoid issues with time offsets
            });
            console.log('Recurrence rule:', rule);  // Log the recurrence rule for debugging

            const RRuleFrequencyMap = {
              [RRule.DAILY]: 'daily',
              [RRule.WEEKLY]: 'weekly',
              [RRule.MONTHLY]: 'monthly',
              [RRule.YEARLY]: 'yearly',
            };

            // Create a new event for each occurrence of the recurring event
            const dates = rule.between(rule.options.dtstart, rule.options.until || new Date('2100-01-01'), true); // true = inclusive
      
            const duration = correctedEnd - icsEvent.start;

            for (const date of dates) {
              
              const newEvent = new Event({
                title: icsEvent.summary || 'Untitled Event',
                startDate: new Date(date),
                endDate: new Date(date.getTime() + duration), //duration is the same for all occurrences
                allDay: isAllDay,
                repeatFrequency: RRuleFrequencyMap[rule.options.freq] || 'custom',
                repeatEndDate: rule.options.until || null,
                repeatTimes: rule.options.count || 0,
                eventLocation: icsEvent.location || 'physical',
                user: user._id,
                fatherId: commonOriginalId,  // Use the same originalId for all occurrences
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
              endDate: correctedEnd,
              allDay: isAllDay,
              repeatFrequency: 'none',
              repeatEndDate: null,
              repeatTimes: 0,
              eventLocation: icsEvent.location || 'physical',
              user: user._id,
              fatherId: commonOriginalId,
            });
            await newEvent.save();
            importedEvents.push(newEvent);

            console.log('Imported single event:', newEvent);  // Log the imported event for debugging
          }
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

const getToolEvents = async (toolId) => {
  try {
    const events = await Event.find({ sharedWith: toolId })
      .populate('user', 'username')
      .populate('sharedWith', 'username')
      .populate('user', 'username')
      .lean();

    if (!events) return { success: false, message: 'No events found' };

    const transformedEvents = events.map(event => {
      return {
        ...event,
        sharedWith: event.sharedWith.map(user => user.username),
      }
    });

    return { success: true, events: transformedEvents };
  } catch (error) {
    console.error('Error fetching tool events:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  getEvents,
  createNewEvent,
  updateEvent,
  deleteEvent,
  exportEvent,
  importEvents,
  getToolEvents,
};