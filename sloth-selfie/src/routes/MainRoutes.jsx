import React, { useContext, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useIsDesktop } from '../utils/utils';
import { StyleProvider } from '../components/StyleContext';
import { AuthContext } from '../contexts/AuthContext';


import Pomodoro from '../pages/Pomodoro/Pomodoro';
import Projects from '../pages/Projects';
import Notes from '../pages/Note/Notes';
import Calendar from '../pages/Calendar/Calendar';
import Home from '../pages/Home'
import Profile from '../pages/ProfilePage';
import ChatBox from '../components/ChatBox';
//TODO: chambiare gli import
/*

import Notifications from '../Notifications';
import Forum from '../Forum';
*/
import AuthPage from '../pages/AuthPage';
import { LoadingPageLight } from '../pages/LoadingPage';

// TODO: implement note id and calendar id */
const MainRoutes = () => {
    const { user } = useContext(AuthContext);
    const isDesktop = useIsDesktop();

    return (
        <Router>
            <Suspense fallback={<LoadingPageLight />}>
                <StyleProvider>
                    <Routes>
                        <Route path='/' element={<Navigate to={user ? '/home' : '/login'} />} />
                        <Route path='/login' element={<AuthPage formType='login' />} />
                        <Route path='/register' element={<AuthPage formType='register' />} />
                        <Route
                            path='/*'
                            element={
                                <ProtectedRoute >
                                    <Routes>

                                        <Route path='/pomodoro' element={<Pomodoro />} />
                                        <Route path='/projects' element={<Projects />} />
                                        <Route path='/calendar' element={<Calendar />} />
                                        <Route path='/notes' element={<Notes />} />
                                        <Route path='/notes/:noteId' element={<Notes openNote={true} />} />
                                        <Route path='/home' element={<Home />} />
                                        <Route path='/home/settings' element={<Home settings={true} />} />
                                        <Route path='/profile' element={<Profile />} />
                                    </Routes>
                                    {/*
                                    <Route path='/notifications' element={<Notifications />} />
                                    <Route path='/calendar' element={<Calendar />} />
                                    <Route path='/forum' element={<Forum />} />*/}
                                    {!isDesktop && (
                                        <Routes>
                                            <Route path='/chat' element={<ChatBox chatId={null} />} />
                                            <Route path='/chat/:chatId' element={<ChatBox />} />
                                        </Routes>
                                    )}
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