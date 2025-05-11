import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

import { useCalendar } from '../contexts/CalendarContext';


const SliderStyled = styled(Slider)(({ value }) => {

    const lightBlue = '#64b5f6';
    const darkBlue = '#244476';

    const getColor = (val) => {
        const intensity = val / 5;
        const r1 = parseInt(lightBlue.slice(1, 3), 16);
        const g1 = parseInt(lightBlue.slice(3, 5), 16);
        const b1 = parseInt(lightBlue.slice(5, 7), 16);
        
        const r2 = parseInt(darkBlue.slice(1, 3), 16);
        const g2 = parseInt(darkBlue.slice(3, 5), 16);
        const b2 = parseInt(darkBlue.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * intensity);
        const g = Math.round(g1 + (g2 - g1) * intensity);
        const b = Math.round(b1 + (b2 - b1) * intensity);
        
        return `rgb(${r}, ${g}, ${b})`;
    };

    return {
        height: 8,
        color: getColor(value),
        '& .MuiSlider-track': {
            border: 'none',
            background: getColor(value),
        },
        '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: `2px solid ${getColor(value)}`,
            '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 8px ${getColor(value)}33`,
            },
        },
        '& .MuiSlider-mark': {
            backgroundColor: 'transparent',
        }
    };
});

const SliderPriority = () => {
    const { selected, event, setEvent } = useCalendar();
    const [data, setData] = useState({});

    const handleChange = (event, newValue) => {
        if (selected.selection === 'event') {
            setEvent({ ...data, priority: newValue });
        }
    };

    useEffect(() => {
        if (selected.selection === 'event') {
            setData(event);
        }
    }, []);
 
    return (
        <div className='d-flex flex-column w-100 py-2 px-4'>
            <SliderStyled
                value={event.priority}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                aria-labelledby="intensity-slider"
            />
        </div>
    );
};

export default SliderPriority;