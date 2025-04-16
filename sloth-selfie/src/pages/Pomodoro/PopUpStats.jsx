import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Swal from 'sweetalert2';
import { apiService } from '../../services/apiService';

const PopUpStats = () => {

    const [totlalPomodoros, setTotalPomodoros] = useState(0);
    const [listTimeMonth, setListTimeMonth] = useState([]);

    const monthLabels = {
        1: 'Gen', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mag', 6: 'Giu',
        7: 'Lug', 8: 'Ago', 9: 'Set', 10: 'Ott', 11: 'Nov', 12: 'Dic'
      };

    const getStudiedTime = async () => {
        const response = await apiService('/pomodoro/studiedTime', 'GET');
        if (response) setTotalPomodoros(response.totalPomodoros);
        else Swal.fire({ icon: 'error', title: 'Error', text: 'Error getting studied time', customClass: { confirmButton: 'button-alert' } });

        console.log(response, 'totalPomodoros');
    }

    const getTimePomodoriMonths = async () => {
        const response = await apiService('/pomodoro/months', 'GET');
        if (response) setListTimeMonth(response);
        else Swal.fire({ icon: 'error', title: 'Error', text: 'Error getting time per month', customClass: { confirmButton: 'button-alert' } });

        console.log(response, 'listTimeMonth');
    }

    useEffect(() => {
        getStudiedTime();
        getTimePomodoriMonths();
    }, []);

    return (
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <div className='d-flex flex-column justify-content-center align-items-center'>
                <h5 className='text-center'>Studied Time: </h5>
                <h5 className='text-center fst-italic'>{Math.floor(totlalPomodoros / 3600)}h {Math.floor((totlalPomodoros % 3600) / 60)}m {totlalPomodoros % 60}s</h5>
            </div>

            {listTimeMonth.length > 0 && (
                <div className='d-flex flex-column justify-content-center align-items-center mt-4'>
                    <h5 className='text-center'>Time studied per month</h5>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={listTimeMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='month' tickFormatter={(value) => monthLabels[value]} />
                            <YAxis />
                            <Tooltip formatter={(value) => [Math.floor(value / 3600), 'h']} />
                            <Bar dataKey='totalStudiedTime' fill='#8884d8' />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            
        </div>
    );
}

export default PopUpStats;

