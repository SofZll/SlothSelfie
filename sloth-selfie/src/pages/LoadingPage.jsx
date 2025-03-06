const LoadingPageDark = () => {
    return (
        <div className="loading-page loading-page-dark">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
        </div>
    );
}

const LoadingPageLight = () => {
    return (
        <div className="loading-page loading-page-light">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
        </div>
    );
}

export { LoadingPageDark, LoadingPageLight };