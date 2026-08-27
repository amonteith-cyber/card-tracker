function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className="loading-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <p>{message}</p>
        </div>
    );
}

export default LoadingSpinner;