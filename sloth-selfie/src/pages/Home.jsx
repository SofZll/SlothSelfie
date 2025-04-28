import React, { useState } from 'react';

import MainLayout from '../layouts/MainLayout';
import '../styles/Home.css';

import PreviewSetUp from './PreviewSetUp';
import CarouselHome from './CarouselHome';
import { CustomizationProvider } from '../contexts/PreviewContext';
import { UserProvider } from '../contexts/UserContext';

const Home = ({ settings = false }) => {

    const [inSettings, setInSettings] = useState(settings);

    return (
        <CustomizationProvider>
            <MainLayout>
                <div className='d-flex h-75 w-100 justify-content-center'>
                    {inSettings ? (
                        <PreviewSetUp setSetUp={setInSettings} />
                    ) : (
                        <UserProvider>
                            <CarouselHome setSetUp={setInSettings} />
                        </UserProvider>
                    )}
                </div>
            </MainLayout>
        </CustomizationProvider>
    )
}
export default Home;