import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useIsDesktop } from '../utils/utils';
import { StyleProvider } from '../StyleContext';


import Home from '../pages/Home'
//TODO: chambiare gli import
/*

import Calendar from '../Calendar';
import Pomodoro from '../Pomodoro';
import Notes from '../Notes';
import Notifications from '../Notifications';
import Profile from '../Profile';
import Forum from '../Forum';
import ChatBox from '../ChatBox';
*/
import AuthPage from '../pages/AuthPage';
import { LoadingPageLight } from '../pages/LoadingPage';

// TODO: implement note id and calendar id */
const MainRoutes = ({ profileData, authenticated, setAuthenticated }) => {
    const isDesktop = useIsDesktop();

    return (
        <Router>
            <Suspense fallback={<LoadingPageLight />}>
                <StyleProvider>
                    <Routes>
                        <Route path='/' element={<Navigate to={authenticated ? '/home' : '/login'} />} />
                        <Route path='/login' element={<AuthPage formType='login' setAuthenticated={setAuthenticated}/>} />
                        <Route path='/register' element={<AuthPage formType='register' setAuthenticated={setAuthenticated} />} />
                        <Route
                            path='/*'
                            element={
                                <ProtectedRoute authenticated={authenticated}>
                                    <Routes>
                                        <Route path='/home' element={<Home />} />
                                        <Route path='/home/settings' element={<Home settings={true} />} />
                                    </Routes>
                                    {/*
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
                                    */}
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </StyleProvider>
            </Suspense>
        </Router>
    );
};

export default MainRoutes;