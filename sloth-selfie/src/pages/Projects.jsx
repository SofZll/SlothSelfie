import React from 'react';

import MainLayout from "../layouts/MainLayout";

const Projects = () => {
    return (
        <MainLayout>
            <iframe
                src='/projects.html'
                title='Projects'
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    overflow: 'auto',
                    justifyContent: 'center',
                }}/>
        </MainLayout>
    );
}

export default Projects;