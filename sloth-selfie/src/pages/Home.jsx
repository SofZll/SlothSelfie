import React, { useState } from 'react';

import MainLayout from '../layouts/MainLayout';
import '../styles/Home.css';

import Settings from './previewSetUp';
import CarouselHome from './CarouselHome';
import { CustomizationProvider } from '../contexts/PreviewContext';

const Home = ({ settings = false }) => {

    const [inSettings, setInSettings] = useState(settings);

    return (
        <CustomizationProvider>
            <MainLayout>
                <div className='d-flex h-75 w-100 justify-content-center'>
                    {inSettings ? (
                        <Settings setSetUp={setInSettings} />
                    ) : (
                        <CarouselHome setSetUp={setInSettings} />
                    )}
                </div>
            </MainLayout>
        </CustomizationProvider>
    )
}
export default Home;