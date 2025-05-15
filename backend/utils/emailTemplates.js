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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: ${elementType === 'Event' ? '#4CAF50' : '#FF9800'}; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Invitation to ${elementType}</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">You've been invited to join!</p>
            </div>
            
            <div style="padding: 25px;">
                <h2 style="color: ${elementType === 'Event' ? '#4CAF50' : '#FF9800'}; margin-top: 0;">${element.title}</h2>
                <p style="font-size: 16px;">Hello <strong>${receiver.username}</strong>,</p>
                <p style="font-size: 16px;">You've been invited to this ${elementType.toLowerCase()} by <strong>${element.user.username}</strong>:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${elementType === 'Event' ? '#4CAF50' : '#FF9800'};">
                    <h3 style="margin-top: 0;">${elementType} Details</h3>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 30%; padding: 5px 0; vertical-align: top;"><strong>Title:</strong></td>
                            <td style="padding: 5px 0;">${element.title}</td>
                        </tr>
                        
                        ${elementType === 'Event' ? `
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>When:</strong></td>
                            <td style="padding: 5px 0;">
                                ${new Date(element.startDate).toLocaleDateString()} 
                                at ${new Date(element.startDate).toLocaleTimeString()} - 
                                ${new Date(element.endDate).toLocaleTimeString()}
                            </td>
                        </tr>
                        ${element.eventLocation === 'physical' ? `
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>Location:</strong></td>
                            <td style="padding: 5px 0;">${reverseAddress(element.eventLocationDetails)}</td>
                        </tr>
                        ` : ''}
                        ${element.eventLocation === 'virtual' ? `
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>Meeting Link:</strong></td>
                            <td style="padding: 5px 0;"><a href="${element.eventLocationDetails}">Click to join</a></td>
                        </tr>
                        ` : ''}
                        ` : `
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>Deadline:</strong></td>
                            <td style="padding: 5px 0;">${new Date(element.deadline).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>Status:</strong></td>
                            <td style="padding: 5px 0;">
                                <span style="color: ${element.completed ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                                    ${element.completed ? 'Completed ✓' : 'Pending ⚠️'}
                                </span>
                            </td>
                        </tr>
                        `}
                        
                        ${element.sharedWith?.length > 0 ? `
                        <tr>
                            <td style="padding: 5px 0; vertical-align: top;"><strong>Also invited:</strong></td>
                            <td style="padding: 5px 0;">${element.sharedWith.map(user => user.username).join(', ')}</td>
                        </tr>
                        ` : ''}
                    </table>
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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2196F3; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${elementType} Updated</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Important changes you should know about</p>
            </div>
            
            <div style="padding: 25px;">
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
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196F3;">
                    <h3 style="margin-top: 0;">Updated Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${elementType === 'Event' ? `
                        <tr>
                            <td style="width: 30%; padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee;"><strong>When:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                                ${new Date(element.startDate).toLocaleDateString()} 
                                at ${new Date(element.startDate).toLocaleTimeString()} - 
                                ${new Date(element.endDate).toLocaleTimeString()}
                            </td>
                        </tr>
                        ${element.eventLocation === 'physical' ? `
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${reverseAddress(element.eventLocationDetails)}</td>
                        </tr>
                        ` : ''}
                        ${element.eventLocation === 'virtual' ? `
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="${element.eventLocation}"></td>
                        </tr>
                        ` : ''}
                        ` : `
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee;"><strong>Deadline:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(element.deadline).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="color: ${element.completed ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                                    ${element.completed ? 'Completed ✓' : 'Pending ⚠️'}
                                </span>
                            </td>
                        </tr>
                        `}
                        
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top;"><strong>Modified by:</strong></td>
                            <td style="padding: 8px 0;">${element.user.username}</td>
                        </tr>
                    </table>
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
    getElementModificationEmail
};