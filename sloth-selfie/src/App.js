
import React, { useEffect, useState } from 'react';
import './css/App.css';

import iconDark from './media/SlothDark.svg';
import { StyleContext, StyleProvider } from './StyleContext';
import Menu from './Menu';
import TimeMachine from './TimeMachine';
import socket from './socket';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import { ActivityProvider } from './ActivityContext';
import { useMediaQuery } from 'react-responsive';
import MainRoutes from './routes/MainRoutes';
import ChatBox from './ChatBox';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  //const [authenticated, setAuthenticated] = useState(isAuthenticated());
  //const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    profile_image: ''
  });
  const isDesktop = useMediaQuery({ minWidth: 769 });

  /*
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);
  */

  // Check if the user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
    
      if (response.ok) {
        setAuthenticated(true);
        socket.emit('authenticated', true);
        console.log('User authenticated');
        // registerServiceWorker();
      } else setAuthenticated(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
    console.log("authenticated: ", authenticated);
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
    setAuthenticated(status);
  };

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
    <>
        { loading ? (
          <div className="loading-page loading-page-light">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
          </div>
        ) : (
          <div className="App">
            <Menu profileData={profileData}/>
            <TimeMachine />
            {isDesktop && <ChatBox username={profileData.username} /> }
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
              <MainRoutes
                profileData={profileData} 
                isDesktop={isDesktop} 
                authenticated={authenticated} 
                setAuthenticated={setAuthenticated}
              />
            </div>
          </div>
        )}
    </>
  );
}

export default App;

