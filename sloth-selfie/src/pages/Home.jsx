import React, { useState } from 'react';

import MainLayout from '../layouts/MainLayout';

import Settings from './previewSetUp';
import CarouselHome from './CarouselHome';


const Home = () => {

    const [inSettings, setInSettings] = useState(false);

    return (
        <MainLayout>
            {inSettings ? (
                <Settings setUp={inSettings} setSetUp={setInSettings} />
            ) : (
                <CarouselHome setUp={inSettings} setSetUp={setInSettings} />
            )}
        </MainLayout>
    )
}
export default Home;