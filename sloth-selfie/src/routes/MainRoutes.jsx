import React, { useEffect, useState, Suspence } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Calendar from '../Calendar';
import Pomodoro from '../Pomodoro';
import Notes from '../Notes';
import Notifications from '../Notifications';
import Profile from '../Profile';
import Forum from '../Forum';
import ChatBox from '../ChatBox';
import AuthPage from '../AuthPage';
import LoadingPage from '../LoadingPage';

import Settings from '../previewSetUp';
import Carousel from '../CarouselHome';
import Card from "./cardCarosel";
import { v4 as uuidv4 } from 'uuid';

// Move carousel and settings to a separate file

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
    // move to a separate file
    const [inSettings, setInSettings] = useState(false);

    useEffect(() => {
        setAuthenticated(isAuthenticated());
    }, []);

    // TODO: move it to a separate file
    let cards = [
        {
            key: uuidv4(),
            content: (
                <Card title="Calendar" caseShow="1" />
            )
        },
        {
            key: uuidv4(),
            content: (
                <Card title="Notes" caseShow="2" />
            )
        },
        {
            key: uuidv4(),
            content: (
                <Card title="Pomodoro" caseShow="3" />
            )
        },
        {
            key: uuidv4(),
            content: (
                <Card title="Projects" caseShow="4" />
            )
        }
    ];

    return (
        <Router>
            <Suspence fallback={<LoadingPage />}>
                <Routes>
                    <Route path='/' element={<Navigate to={authenticated ? '/home' : '/login'} />} />
                    <Route path='/login' element={<AuthPage formType='login' />} />
                    <Route path='/register' element={<AuthPage formType='register' />} />
                    <Route
                        path='/*'
                        element={
                            <ProtectedRoute authenticated={authenticated}>
                                <Route 
                                    path='/home'
                                    element={
                                        inSettings ? (
                                            <Settings setUp={inSettings} setSetUp={setInSettings} />
                                        ) : (
                                            <Carousel
                                                cards={cards}
                                                offset={2}
                                                showArrows={false}
                                                setUp={inSettings}
                                                setSetUp={setInSettings}
                                            />
                                        )
                                    }
                                />
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