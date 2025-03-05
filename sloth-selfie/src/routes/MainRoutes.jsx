import React, { useEffect, useState, Suspence } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

//TODO: chambiare gli import
import Home from '../Home'
import Calendar from '../Calendar';
import Pomodoro from '../Pomodoro';
import Notes from '../Notes';
import Notifications from '../Notifications';
import Profile from '../Profile';
import Forum from '../Forum';
import ChatBox from '../ChatBox';
import Form from '../Form';
import LoadingPage from '../LoadingPage';

const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // TODO: jwt decode
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const isExpired = decodedToken.exp * 1000 < Date.now();
    return !isExpired;
};

// TODO: isDesktop should be a general prop
const MainRoutes = ({ profileData, isDesktop }) => {
    const [authenticated, setAuthenticated] = useState(isAuthenticated());

    useEffect(() => {
        setAuthenticated(isAuthenticated());
    }, []);


    return (
        <Router>
            <Suspence fallback={<LoadingPage />}>
                <Routes>
                    <Route path='/' element={<Navigate to={authenticated ? '/home' : '/login'} />} />
                    <Route path='/login' element={<Form formType='login' />} />
                    <Route path='/register' element={<Form formType='register' />} />
                    <Route
                        path='/*'
                        element={
                            <ProtectedRoute authenticated={authenticated}>
                                <Route path='/home' element={<Home />} />
                                <Route path='/profile' element={<Profile />} />
                                <Route path='/notifications' element={<Notifications />} />
                                <Route path='/pomodoro' element={<Pomodoro />} />
                                <Route path='/notes' element={<Notes />} />
                                <Route path='/calendar' element={<Calendar />} />
                                <Route path='/forum' element={<Forum />} />
                                {!isDesktop && (
                                    <>
                                    <Route path='/chat' element={<ChatBox username={profileData.username} chatId={null} />} />
                                    <Route path='/chat/:chatId' element={<ChatBox username={profileData.username} />} />
                                    </>
                                )}
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspence>
        </Router>
    );
};

export default MainRoutes;