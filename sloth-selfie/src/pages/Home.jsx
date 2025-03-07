import React, { useState } from 'react';

import MainLayout from '../layouts/MainLayout';
import '../css/App.css';

import Settings from './previewSetUp';
import CarouselHome from './CarouselHome';


const Home = ({ settings = false }) => {

    const [inSettings, setInSettings] = useState(settings);

    return (
        <MainLayout>
            <div className='d-flex h-75 w-100 justify-content-center'>
                {inSettings ? (
                    <Settings setUp={inSettings} setSetUp={setInSettings} />
                ) : (
                    <CarouselHome setUp={inSettings} setSetUp={setInSettings} />
                )}
            </div>
        </MainLayout>
    )
}
export default Home;