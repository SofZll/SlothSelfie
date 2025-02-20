import React, {useEffect, useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Calendar from './Calendar';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import Settings from './previewSetUp';
import NotificationFunction from './Notifications';
import Form from './Login';
import Card from "./cardCarosel";
import Carousel from "./CarouselHome";
import iconDark from './media/SlothDark.svg';
import { v4 as uuidv4 } from "uuid";
import { StyleContext, StyleProvider } from './StyleContext';
import Menu from './Menu';
import ProfileFunction from './Profile';
import ForumFunction from './Forum';
import TimeMachine from './TimeMachine';
import socket from './socket';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import { ActivityProvider } from './ActivityContext';
import MesssageBox from './MessageBox';

function App() {
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formType, setFormType] = useState('login');

  const [inSettings, setInSettings] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    profile_image: ''
  });

  // Check if the user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
    
      if (response.ok) {
        setIsAuthenticated(true);
        socket.emit('authenticated', true);
        console.log('User authenticated');
        // registerServiceWorker();
      } else setIsAuthenticated(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
    console.log("isAuthenticated: ", isAuthenticated);
  };

  useEffect(() => {
    checkAuth();

    socket.on('notification', (newNotif) => {
      console.log('New notification received:', newNotif);
      
      const notification = new Notification(newNotif.title, {
        body: newNotif.body,
        //icon: newNotif.icon,
        //badge: newNotif.badge,
        sender: newNotif.sender,
        type: newNotif.type,
      });

      notification.onclick = () => {
        console.log('Notification clicked');
        Swal.fire({
          title: newNotif.title,
          text: newNotif.body,
          icon: 'info',
          confirmButtonText: 'Ok',
        });
      }
    });

    return () => {
      socket.off("notification");
    }
  }, []);

  // Since the image is stored a Buffer we need to convert it to base64
  let base64Image = '';
  const bufferToBase64 = (buffer) => {
    const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
    return btoa(binary);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user/profile`, {
          method: 'GET',
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.user) {
          if (data.user.image?.data?.data) {
            const buffer = data.user.image.data.data;
            base64Image = `data:${data.user.image.contentType};base64,${bufferToBase64(buffer)}`;
          }

          setProfileData({
            username: data.user.username || '',
            profile_image: base64Image
          });

          console.log('Profile data:', data.user);
        }
      } catch (error) {
          console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []); 
  
  const handleLogin = (status) => {
    console.log("Login status:", status);
    setIsAuthenticated(status);
  };

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

  /* RICORDATI DI RIGUARDARE CHECK-AUTH NON FUNZIONA 
  if ("Notification" in window && navigator.serviceWorker) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notifiche attivate!");
      }
    });
  }
  
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator && isAuthenticated) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registrato con successo:', registration);

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          return subscription;
        }

        const newSubscription = registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BNI2252O4XvM3IAQ_jF_U-dY_XZG3swWR60TYnUhBF-lTWhOWc2EvkBqaVceiQiF6xu89K8WCAPye4xf6e23EsE'
        });
        console.log('Subscription:', newSubscription);

        await fetch('http://localhost:3000/api/subscribe', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }
  };
  */

  return (
    <Router>
      <StyleProvider>
        <ActivityProvider>
          { loading ? (
            <div className="loading-page loading-page-light">
              <div className="spinner"></div>
              <p>Loading, please wait...</p>
            </div>
          ) : (
            <div className="App">
              <Menu profileData={profileData}/>
              <TimeMachine />
              <MesssageBox username={profileData.username} />
              <header className="App-header">
                  <div className="title">
                  <StyleContext.Consumer>
                    {({ icon }) => (
                      <h1 style={{ color: icon === iconDark ? '#222D52' : '#FAF9F9' }}>
                        Sloth Selfie
                      </h1>
                    )}
                  </StyleContext.Consumer>
                  </div>
                  <StyleContext.Consumer>
                    {({ icon }) => <img src={icon} className="App-logo" alt="logo" />}
                  </StyleContext.Consumer>
              </header>
              <div className="App-body">
                <Routes>
                  <Route
                      path="/"
                      element={<Navigate to={checkAuth ? "/home" : "/login"} />}
                  />
                  <Route 
                    path="/login" 
                    element={<Form formType={formType} setFormType={setFormType} handleLogin={handleLogin}/>}
                  />
                  <Route 
                    path="/register" 
                    element={<Form formType="register" setFormType={setFormType}/>}
                  />
                  <Route path="home"
                    element={ 
                    isAuthenticated ? ( 
                      inSettings ? (
                        <Settings
                          setUp={inSettings}
                          setSetUp={setInSettings}
                        />
                      ) : (
                        <Carousel
                            cards={cards}
                            offset={2}
                            showArrows={false}
                            setUp={inSettings}
                            setSetUp={setInSettings}
                        />)
                    ) : (
                      <Navigate to="/login" />
                    )
                    }
                  />
                  <Route path="/profile" element={<ProfileFunction setLoading={setLoading}/>} />
                  <Route path="/notifications" element={<NotificationFunction />} />
                  <Route path="/pomodoro" element={<PomodoroFunction />} />
                  <Route path="/notes" element={<NotesFunction />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/forum" element={<ForumFunction />} />
                </Routes>
              </div>
            </div>
          )}
        </ActivityProvider>
      </StyleProvider>
    </Router>
  );
}

export default App;
