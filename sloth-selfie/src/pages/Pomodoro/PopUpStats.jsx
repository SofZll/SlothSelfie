import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';

import Swal from 'sweetalert2';
import { apiService } from '../../services/apiService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement
);

const PopUpStats = () => {

    const [totalPomodoros, setTotalPomodoros] = useState(0);
    const [listTimeMonth, setListTimeMonth] = useState([
        { month: 11, totalStudiedTime: 3600 }, // 1 ora
        { month: 0, totalStudiedTime: 7200 },  // 2 ore
        { month: 1, totalStudiedTime: 10800 }, // 3 ore
        { month: 2, totalStudiedTime: 0 },     // 0 ore
        { month: 3, totalStudiedTime: 18000 }  // 5 ore
    ]);

    const monthLabels = {
        0: 'Gen', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun',
        6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec'
    };

    const getStudiedTime = async () => {
        const response = await apiService('/pomodori/studied-time', 'GET');
        if (response) setTotalPomodoros(response.totalStudiedTime);
        else Swal.fire({ icon: 'error', title: 'Error', text: 'Error getting studied time', customClass: { confirmButton: 'button-alert' } });

    }

    const getTimePomodoriMonths = async () => {
        const response = await apiService('/pomodori/months', 'GET');
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
                <div className='text-center fs-5 fw-bold text-secondary'>Studied Time: </div>
                <div className='text-center fs-5 fst-italic'>{Math.floor(totalPomodoros / 3600)}h {Math.floor((totalPomodoros % 3600) / 60)}m {totalPomodoros % 60}s</div>
            </div>

            {listTimeMonth.length > 0 && (
                <div className='d-flex flex-column justify-content-center align-items-center mt-3'>
                    <div style={{ width: '250px', height: '250px' }}>
                        <Bar
                            data={{
                                labels: listTimeMonth.map(item => monthLabels[item.month]),
                                datasets: [
                                    {
                                        label: 'Studied Time',
                                        data: listTimeMonth.map(item => item.totalStudiedTime),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.2)',
                                            'rgba(255, 159, 64, 0.2)',
                                            'rgba(255, 205, 86, 0.2)',
                                            'rgba(75, 192, 192, 0.2)',
                                            'rgba(54, 162, 235, 0.2)'
                                        ],
                                        borderColor: [
                                            'rgb(255, 99, 132)',
                                            'rgb(255, 159, 64)',
                                            'rgb(255, 205, 86)',
                                            'rgb(75, 192, 192)',
                                            'rgb(54, 162, 235)'
                                        ],
                                        borderWidth: 1,
                                        
                                    }
                                ]
                            }}
                            options={
                                {
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Pomodoro Statistics',
                                            font: {
                                                size: 20
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            }
                        />
                    </div>
                </div>
            )}

            
        </div>
    );
}

export default PopUpStats;

