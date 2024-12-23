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
        try {
            const result = await addNoAvailability(
                formData.startDate,
                formData.endDate,
                formData.repeatFrequency
            );
            setNoAvailability([...noAvailability, result.NoAvailability]); // we update the state with a new period of no availability
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
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </label>
                        <button className = 'btn-small-blue' type="submit">Add No Availability</button>
                    </form>

                    {/* List of periods */}
                    <ul>
                        {noAvailability.map((item) => (
                            <li key={item._id}>
                                {item.startDate} - {item.endDate} ({item.repeatFrequency})
                                <button onClick={() => handleRemoveNoAvailability(item._id)}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
    );
};

export default CalendarNoAvailability;