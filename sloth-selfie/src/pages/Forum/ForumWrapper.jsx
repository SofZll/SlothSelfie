import React from 'react';

import { ForumProvider } from '../../contexts/ForumContext';
import Forum from './Forum';

import MainLayout from '../../layouts/MainLayout';

const ForumWrapper = () => {
    return (
        <MainLayout>
            <ForumProvider>
                <Forum />
            </ForumProvider>
        </MainLayout>
    )
}

export default ForumWrapper;