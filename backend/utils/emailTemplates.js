const { getCurrentNow } = require("../services/timeMachineService");

const getEventProgrammedEmail = (event, receiver) => ({
    subjectContent: `Event Reminder: ${event.title}`,
    htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Event Reminder</h1>
            </div>
            
            <div style="padding: 20px;">
                <h2 style="color: #4CAF50; margin-top: 0;">${event.title}</h2>
                <p>Hello <strong>${receiver.username}</strong>,</p>
                <p>This is a friendly reminder about the upcoming event:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <ul style="padding-left: 20px; margin: 0;">
                        <li><strong>Title:</strong> ${event.title}</li>
                        <li><strong>Type:</strong> ${event.type}</li>
                        <li><strong>Priority:</strong> ${event.priority}</li>
                        ${event.user.username !== receiver.username ? `<li><strong>Organizer:</strong> ${event.user.username}</li>` : ''}
                        ${event.sharedWith?.length > 0 ? `<li><strong>Shared with:</strong> ${event.sharedWith.map(user => user.username).join(', ')}</li>` : ''}
                        <li><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</li>
                        <li><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</li>
                        ${event.eventLocation === 'physical' ? `<li><strong>Location:</strong> ${reverseAddress(event.eventLocationDetails)}</li>` : ''}
                        ${event.eventLocation === 'virtual' ? `<li><strong>Location:</strong> ${event.eventLocation}</li>` : ''}
                    </ul>
                </div>
                
                <p style="margin-bottom: 25px;">We look forward to seeing you there!</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://site232453.tw.cs.unibo.it/calendar?type=Event&element=${event._id}" 
                       style="display: inline-block; background-color: #4CAF50; color: white; 
                              text-decoration: none; padding: 12px 25px; border-radius: 5px;
                              font-weight: bold;">
                        View Event Details
                    </a>
                </div>
                
                <p style="font-size: 0.9em; color: #777;">
                    If you can't attend, please update your status on the event page.
                </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.8em; color: #666;">
                <p>This is an automated message from Sloth Selfie. Please do not reply directly to this email.</p>
            </div>
        </div>
    `
});

const getActivityProgrammedEmail = (activity, receiver) => ({
    subjectContent: `Activity Reminder: ${activity.title}`,
    htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF9800; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Activity Reminder</h1>
            </div>
            
            <div style="padding: 20px;">
                <h2 style="color: #FF9800; margin-top: 0;">${activity.title}</h2>
                <p>Hello <strong>${receiver.username}</strong>,</p>
                <p>This is a friendly reminder about an upcoming activity deadline:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <ul style="padding-left: 20px; margin: 0;">
                        <li><strong>Title:</strong> ${activity.title}</li>
                        <li><strong>Deadline:</strong> ${new Date(activity.deadline).toLocaleString()}</li>
                        ${activity.user.username !== receiver.username ? `<li><strong>Organizer:</strong> ${activity.user.username}</li>` : ''}
                        ${activity.sharedWith?.length > 0 ? `<li><strong>Shared with:</strong> ${activity.sharedWith.map(user => user.username).join(', ')}</li>` : ''}
                        <li><strong>Status:</strong> <span style="color: ${activity.completed ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                            ${activity.completed ? 'Completed ✓' : 'Pending ⚠️'}
                        </span></li>
                    </ul>
                </div>
                
                <p style="margin-bottom: 25px;">${activity.completed ? 
                    'Great job completing this activity!' : 
                    'Please make sure to complete it before the deadline!'}</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://site232453.tw.cs.unibo.it/calendar?type=Activity&element=${activity._id}" 
                       style="display: inline-block; background-color: #FF9800; color: white; 
                              text-decoration: none; padding: 12px 25px; border-radius: 5px;
                              font-weight: bold;">
                        View Activity Details
                    </a>
                </div>
                
                ${!activity.completed ? `
                <div style="background-color: #FFF3E0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #E65100;">⏰ Deadline Approaching!</h3>
                    <p>Time remaining: ${getTimeRemaining(activity.deadline)}</p>
                </div>
                ` : ''}
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.8em; color: #666;">
                <p>This is an automated message from Sloth Selfie. Please do not reply directly to this email.</p>
            </div>
        </div>
    `
});

const getElementInvitationEmail = (element, elementType, receiver) => ({
    subjectContent: `You're Invited: ${element.title}`,
    htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; overflow: hidden;">
            <div style="background-color: ${elementType === 'Event' ? '#4CAF50' : '#FF9800'}; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Invitation to ${elementType}</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">You've been invited to join!</p>
            </div>
            
            <div style="padding: 20px;">
                <h2 style="color: ${elementType === 'Event' ? '#4CAF50' : '#FF9800'}; margin-top: 0;">${element.title}</h2>
                <p style="font-size: 16px;">Hello <strong>${receiver.username}</strong>,</p>
                <p style="font-size: 16px;">You've been invited to this ${elementType.toLowerCase()} by <strong>${element.user.username}</strong>:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; ">
                    <ul style="padding-left: 20px; margin: 0;">
                        <li><strong> Title:</strong> ${element.title}</li>
                        ${elementType === 'Event' ? `
                            <li><strong>When:</strong>
                                    ${new Date(element.startDate).toLocaleDateString()} 
                                    at ${new Date(element.startDate).toLocaleTimeString()} - 
                                    ${new Date(element.endDate).toLocaleDateString()}
                                    ${new Date(element.endDate).toLocaleTimeString()}
                            </li>
                            ${element.eventLocation === 'physical' ? `
                            <li><strong>Location:</strong> ${reverseAddress(element.eventLocationDetails)}</li>
                            ` : ''}
                            ${element.eventLocation === 'virtual' ? `
                            <li><strong>Location:</strong> ${element.eventLocation}</li>
                            ` : ''}
                        ` : `
                            <li><strong>Deadline:</strong> ${new Date(element.deadline).toLocaleString()}</li>
                            <li><strong>Status:</strong>
                                <span style="color: ${element.completed ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                                    ${element.completed ? 'Completed ✓' : 'Pending ⚠️'}
                                </span>
                            </li>
                        `}
                        
                        ${element.sharedWith?.length > 0 ? `
                        <li><strong>Also invited:</strong> ${element.sharedWith.map(user => user.username).join(', ')}</li>
                        ` : ''}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://site232453.tw.cs.unibo.it/calendar?type=${elementType}&element=${element._id}" 
                       style="display: inline-block; background-color: ${elementType === 'Event' ? '#4CAF50' : '#FF9800'}; 
                              color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px;
                              font-weight: bold; font-size: 16px; margin: 0 10px;">
                        View ${elementType} Details
                    </a>
                </div>
                
                <p style="font-size: 15px; text-align: center; color: #666;">
                    Please respond to this invitation by accepting or declining on the platform.
                </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.8em; color: #666; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">This invitation was sent via Sloth Selfie. Do not reply directly to this email.</p>
            </div>
        </div>
    `
});

const getElementModificationEmail = (element, elementType) => ({
    subjectContent: `Updated: Changes to your ${elementType} "${element.title}"`,
    htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: overflow: hidden;">
            <div style="background-color: #2196F3; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${elementType} Updated</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Important changes you should know about</p>
            </div>
            
            <div style="padding: 20px;">
                <div style="background-color: #E3F2FD; padding: 15px; border-radius: 6px; margin-bottom: 20px; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#2196F3" style="margin-right: 10px;">
                        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    </svg>
                    <div>
                        <h3 style="margin: 0 0 5px 0; color: #0D47A1;">Update Notification</h3>
                        <p style="margin: 0; font-size: 14px;">The ${elementType.toLowerCase()} you're participating in has been modified.</p>
                    </div>
                </div>

                <h2 style="color: #2196F3; margin-top: 0; border-bottom: 2px solid #BBDEFB; padding-bottom: 10px;">${element.title}</h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <ul style="padding-left: 20px; margin: 0;">
                        ${elementType === 'Event' ? `
                        <li><strong>When:</strong>
                            ${new Date(element.startDate).toLocaleDateString()} 
                            at ${new Date(element.startDate).toLocaleTimeString()} - 
                            ${new Date(element.endDate).toLocaleDateString()}
                            ${new Date(element.endDate).toLocaleTimeString()}
                        </li>
                        ${element.eventLocation === 'physical' ? `
                        <li><strong>Location:</strong> ${reverseAddress(element.eventLocationDetails)}</li>
                        ` : ''}
                        ${element.eventLocation === 'virtual' ? `
                        <li><strong>Location:</strong> ${element.eventLocation}</li>
                        ` : ''}
                        ` : `
                        <li><strong>Deadline:</strong> ${new Date(element.deadline).toLocaleString()}</li>
                        <li><strong>Status:</strong>
                            <span style="color: ${element.completed ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                                ${element.completed ? 'Completed ✓' : 'Pending ⚠️'}
                            </span>
                        </li>
                        `}
                        <li><strong>Modified by:</strong> ${element.user.username}</li>
                    </ul>
                </div>
                
                <div style="margin: 30px 0; text-align: center;">
                    <a href="https://site232453.tw.cs.unibo.it/calendar?type=${elementType}&element=${element._id}" 
                       style="display: inline-block; background-color: #2196F3; color: white; 
                              text-decoration: none; padding: 14px 30px; border-radius: 6px;
                              font-weight: bold; font-size: 16px; margin: 0 10px;">
                        View Updated ${elementType}
                    </a>
                </div>
                
                <div style="background-color: #FFF3E0; padding: 15px; border-radius: 6px; margin-top: 25px;">
                    <h3 style="margin-top: 0; color: #E65100;">What's Changed?</h3>
                    <p style="margin-bottom: 0;">The system has detected modifications to this ${elementType.toLowerCase()}. Please review the updated details above to stay informed.</p>
                </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.8em; color: #666; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">This notification was sent by Sloth Selfie. Do not reply directly to this email.</p>
            </div>
        </div>
    `
});

const getUrgencyEmail = (activity, receiver) => ({
    subjectContent: `URGENT: Action Required for Activity "${activity.title}"`,
    htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; overflow: hidden;">
            <div style="background-color: #F44336; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">URGENT: Activity Deadline Approaching</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Immediate action required for pending activity</p>
            </div>
            
            <div style="padding: 20px;">
                <div style="background-color: #FFEBEE; padding: 15px; border-radius: 6px; margin-bottom: 20px; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F44336" style="margin-right: 10px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div>
                        <h3 style="margin: 0 0 5px 0; color: #B71C1C;">Urgent Activity Alert</h3>
                        <p style="margin: 0; font-size: 14px;">This activity requires your immediate attention before the deadline.</p>
                    </div>
                </div>

                <h2 style="color: #F44336; margin-top: 0; border-bottom: 2px solid #FFCDD2; padding-bottom: 10px;">${activity.title}</h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; ">
                    <ul style="padding-left: 20px; margin: 0;">
                        <li><strong>Title:</strong> ${activity.title}</li>
                        <li><strong>Deadline:</strong> ${new Date(activity.deadline).toLocaleString()}</li>
                        ${activity.user.username !== receiver.username ? `<li><strong>Assigned by:</strong> ${activity.user.username}</li>` : ''}
                        <li><strong>Status:</strong>
                            <span style="color: #F44336; font-weight: bold;">
                                Pending ⚠️
                            </span>
                        </li>
                        ${activity.sharedWith?.length > 0 ? `<li><strong>Shared with:</strong> ${activity.sharedWith.map(user => user.username).join(', ')}</li>` : ''}
                    </ul>
                </div>
                
                <div style="background-color: #FFF3E0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #E65100;">⏰ Deadline Approaching!</h3>
                    <p style="margin-bottom: 0;">
                        The deadline for this activity is approaching fast! Please complete it as soon as possible.
                    </p>
                    <p style="margin: 10px 0 0; font-weight: bold;">
                        Time remaining: ${getTimeRemaining(activity.deadline)}
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://site232453.tw.cs.unibo.it/calendar?type=Activity&element=${activity._id}" 
                       style="display: inline-block; background-color: #F44336; color: white; 
                              text-decoration: none; padding: 14px 30px; border-radius: 6px;
                              font-weight: bold; font-size: 16px; margin: 0 10px;">
                        View Activity Details
                    </a>
                </div>
                
                <div style="background-color: #E8F5E9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2E7D32;">✔️ Mark as Complete</h3>
                    <p style="margin-bottom: 0;">
                        Once you've completed this activity, remember to mark it as done in the system.
                    </p>
                </div>
                
                <p style="font-size: 15px; text-align: center; color: #666;">
                    Please take action immediately to avoid missing this important deadline.
                </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 0.8em; color: #666; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">This urgent notification was sent by Sloth Selfie. Do not reply directly to this email.</p>
            </div>
        </div>
    `
});

const reverseAddress = async ([lat, lon]) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=it`;
    const response = await fetch(url, {
        headers: {
            "User-Agent": "SlothSelfieApp (kaorijiang88@email.com)"
        }
    });

    if (!response.ok) throw new Error('Error reverse geocoding');
    
    const data = await response.json();
    return data.display_name;
};

function getTimeRemaining(deadline) {
    const now = getCurrentNow();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) return "Deadline passed";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours remaining`;
}

module.exports = {
    getEventProgrammedEmail,
    getActivityProgrammedEmail,
    getElementInvitationEmail,
    getElementModificationEmail,
    getUrgencyEmail
};