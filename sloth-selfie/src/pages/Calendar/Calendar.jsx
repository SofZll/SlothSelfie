import React, { useState, useEffect } from 'react';
import { useIsDesktop } from '../../utils/utils';

import MainLayout from '../../layouts/MainLayout';
import Planner from './Planner';
import ScrollListLayout from '../../components/ScrollList';
import FormCalendar from './FormCalendar';

import '../../styles/Calendar.css';

import { Plus } from 'lucide-react';

import { ActivityProvider } from '../../contexts/ActivityContext';
import { EventProvider } from '../../contexts/EventContext';
import { AvailabilityProvider } from '../../contexts/AvailabilityContext';


const Calendar = () => {

    const isDesktop = useIsDesktop();
    const [isAdding, setIsAdding] = useState(false);

    const [activities, setActivities] = useState([]);
    const [events, setEvents] = useState([]);

    return (
        <MainLayout>
            <ActivityProvider>
                <EventProvider>
                    <AvailabilityProvider>
                        <div className='d-flex w-100 h-100 py-5 position-relative'>

                            <div className='d-flex flex-column flex-grow-1 justify-content-center align-items-center'>
                                <Planner />

                                {!isDesktop && (
                                    <ScrollListLayout CardList={activities} smallView={false} />
                                )}
                            </div>
                            
                            {isDesktop ? (
                                <div className='d-flex w-25'>
                                    <FormCalendar />
                                </div>
                            ) : (
                                <>
                                    <button className='btn-main rounded-circle p-2 position-fixed end-0 mx-3 btn-plus' alt='add'>
                                        <Plus size={36} color="#fafafa" strokeWidth={1.75} />
                                    </button>

                                    {isAdding && (
                                        <div className='d-flex flex-column w-50 h-50 bg-white rounded p-3 position-fixed top-50 start-50 translate-middle'>
                                            <FormCalendar />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </AvailabilityProvider>
                </EventProvider>
            </ActivityProvider>
        </MainLayout>
    )
}

export default Calendar;
