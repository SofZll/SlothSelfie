import React, { useState, useEffect } from 'react';
import {fetchNoAvailability, addNoAvailability, removeNoAvailability} from  './CalendarUtils';

const CalendarNoAvailability = () => {
    const [noAvailability, setNoAvailability] = useState([]);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        repeatFrequency: 'none',
    });

    //fetch the no availability periods for the user
    useEffect(() => {
        fetchNoAvailability(setNoAvailability).catch((error) =>
            console.error('Error fetching no availability:', error)
        );
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNoAvailability = async (e) => {
        e.preventDefault();
        console.log('Sending data:', formData);
        try {
             // Validation
            if (!formData.startDate || !formData.endDate) {
                console.error('Start date or end date is missing');
                return;
            }
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                console.error('Start date cannot be after end date');
                return;
            }

            const result = await addNoAvailability(
                formData.startDate,
                formData.endDate,
                formData.repeatFrequency
            );

            console.log('Result from backend:', result);

            setNoAvailability(prev => [...prev, result.noAvailability]);// we update the state with a new period of no availability
            setFormData({ startDate: '', endDate: '', repeatFrequency: 'none' }); // Reset form
        } catch (error) {
            console.error('Error adding no availability:', error);
        }
    };

    const handleRemoveNoAvailability = async (id) => {
        try {
            await removeNoAvailability(id);
            setNoAvailability(noAvailability.filter((item) => item._id !== id));
        } catch (error) {
            console.error('Error removing no availability:', error);
        }
    };
    console.log('noAvailability data:', noAvailability);

    return (
        <div>
            {
                <div className="no-availability-manager">
                    {/* Form to add the periods of no availability*/}
                    <form onSubmit={handleAddNoAvailability}>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Repeat Frequency:
                            <select
                                name="repeatFrequency"
                                value={formData.repeatFrequency}
                                onChange={handleInputChange}
                            >
                                <option value="none">None</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </label>
                        <button className = 'btn-small-blue' type="submit">Add No Availability</button>
                    </form>

                    {/* List of periods */}
                    <ul>
                    <div className="scrollable-Card-list">
                        {noAvailability.map((item) => (
                            <div className= 'activity-card' key={item._id}> 
                                {new Date(item.startDate).toLocaleDateString() } - {new Date(item.endDate).toLocaleDateString() } ({item.repeatFrequency})
                                <button className='btn-small-blue' onClick={() => handleRemoveNoAvailability(item._id)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    </ul>
                </div>
            }
        </div>
    );
};

export default CalendarNoAvailability;