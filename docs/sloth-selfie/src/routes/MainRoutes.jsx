import React, { useContext, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useIsDesktop } from '../utils/utils';
import { StyleProvider } from '../contexts/StyleContext';
import { AuthContext } from '../contexts/AuthContext';

import Pomodoro from '../pages/Pomodoro/Pomodoro';
import Projects from '../pages/Projects';
import Notes from '../pages/Note/Notes';
import Calendar from '../pages/Calendar/Calendar';
import Home from '../pages/Home'
import Profile from '../pages/ProfilePage';
import ChatBox from '../components/ChatBox/ChatBox';
import Notifications from '../pages/Notifications';
import ForumWrapper from '../pages/Forum/ForumWrapper';

import AuthPage from '../pages/AuthPage';
import { LoadingPageLight } from '../pages/LoadingPage';
import { ChatProvider } from '../contexts/ChatContext';
import SocketHandler from '../components/SocketHandler';

// TODO: implement note id and calendar id */
const MainRoutes = () => {
    const { user } = useContext(AuthContext);
    const isDesktop = useIsDesktop();

    const protectedRoutes = [];

    if (user?.isAdmin) {
        protectedRoutes.push(
            <Route key="admin" path="/admin" element={<Calendar />} />
        );
    } else if (user) {
        protectedRoutes.push(
            <Route key="pomodoroId" path="/pomodoro/:pomodoroId" element={<Pomodoro />} />,
            <Route key="pomodoro" path="/pomodoro" element={<Pomodoro />} />,
            <Route key="projects" path="/projects" element={<Projects />} />,
            <Route key="calendar" path="/calendar" element={<Calendar />} />,
            <Route key="notes" path="/notes" element={<Notes openNote={false} />} />,
            <Route key="noteId" path="/notes/:noteId" element={<Notes openNote={true} />} />,
            <Route key="home" path="/home" element={<Home />} />,
            <Route key="homeSettings" path="/home/settings" element={<Home settings={true} />} />,
            <Route key="profile" path="/profile" element={<Profile />} />,
            <Route key="notifications" path="/notifications" element={<Notifications />} />,
            <Route key="forum" path="/forum" element={<ForumWrapper />} />
        );

        if (!isDesktop) {
            protectedRoutes.push(
                <Route key="chat" path="/chat" element={<ChatBox chatId={null} />} />,
                <Route key="chatId" path="/chat/:chatId" element={<ChatBox />} />
            );
        }
    }

    return (
        <Router>
            <Suspense fallback={<LoadingPageLight />}>
                <StyleProvider>
                    <ChatProvider>
                        { user &&  <SocketHandler /> }
                        <Routes>
                            <Route path='/' element={<Navigate to={user ? (user.isAdmin ? '/admin' : '/home') : '/login'} />} />
                            <Route path='/login' element={<AuthPage formType='login' />} />
                            <Route path='/register' element={<AuthPage formType='register' />} />
                            <Route element={<ProtectedRoute />}>
                                {protectedRoutes}
                            </Route>
                        </Routes>
                    </ChatProvider>
                </StyleProvider>
            </Suspense>
        </Router>
    );
};

export default MainRoutes;