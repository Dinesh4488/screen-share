import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenShare } from '../hooks/useScreenShare';
import Button from '../components/Button';
import '../styles/ScreenShareTest.css';

/**
 * ScreenShareTest Page Component
 * 
 * This page shows the screen sharing interface where:
 * 1. User can start/stop screen capture
 * 2. Live video preview is displayed
 * 3. Screen information is shown (resolution, frame rate, etc)
 * 4. Errors are displayed if something goes wrong
 * 5. User can retry or go back home
 */
export default function ScreenShareTest() {
  // Getting navigation function to move between pages
  const navigate = useNavigate();
  
  // Getting everything we need from the screen sharing hook
  const {
    videoRef,
    streamRef,
    status,
    errorMessage,
    deviceInfo,
    captureTime,
    startCapture,
    stopCapture,
    togglePause,
    resetCapture
  } = useScreenShare();

  /**
   * useEffect Hook: Cleanup when component closes
   * 
   * Important: If the user closes the page while screen sharing,
   * we need to stop everything and release resources.
   * This prevents crashes and memory leaks.
   */
  useEffect(() => {
    // This function runs when the component is removed from the page
    return () => {
      // If there's an active stream, properly stop it
      if (streamRef.current) {
        // Get all tracks (like audio and video)
        const allTracks = streamRef.current.getTracks();
        
        // Stop each track
        allTracks.forEach(track => {
          track.onended = null; // Remove event listener
          track.stop(); // Stop the track
        });
        
        streamRef.current = null; // Clear the reference
      }
    };
  }, [streamRef]); // Re-run if streamRef changes

  /**
   * When user clicks "Back to Home"
   * Stop the screen share first, then navigate home
   */
  function handleBackToHome() {
    // If stream is running, stop it before leaving
    if (streamRef.current) {
      stopCapture();
    }
    // Go back to the home page
    navigate('/');
  }

  /**
   * When user clicks "Retry"
   * Reset to the starting state so they can try again
   */
  function handleRetry() {
    resetCapture();
  }

  /**
   * Convert status code to friendly text for display
   * Example: 'capturing' becomes 'Screen sharing active'
   */
  function getStatusDisplay() {
    // Simple object mapping: status → user-friendly message
    const statusMessages = {
      'idle': 'Ready to start',
      'requesting': 'Requesting permission...',
      'capturing': 'Screen sharing active',
      'paused': 'Screen sharing paused',
      'stopped': 'Screen sharing stopped',
      'cancelled': 'Permission cancelled',
      'permission_denied': 'Permission denied',
      'error': 'Error occurred'
    };
    
    // Return the message, or the status itself if not found
    return statusMessages[status] || status;
  }

  /**
   * Convert error type codes to friendly text
   * Example: 'permission_denied' becomes 'Permission Denied'
   */
  function formatErrorType(errorType) {
    const errorNames = {
      'permission_denied': 'Permission Denied',
      'user_cancelled': 'User Cancelled',
      'no_display': 'No Display Found',
      'not_supported': 'Not Supported',
      'unknown': 'Unknown Error',
      'stop_error': 'Stop Error',
      'toggle_error': 'Toggle Error'
    };
    
    return errorNames[errorType] || errorType;
  }

  // ===== RENDER (Return JSX) =====
  return (
    <div className="screen-share-container">
      {/* Page Header */}
      <header className="screen-share-header">
        <h1>Screen Share Test</h1>
        <Button
          variant="secondary"
          onClick={handleBackToHome}
          ariaLabel="Back to home"
        >
          ← Back
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="screen-share-main">
        <div className="screen-share-content">
          
          {/* LEFT SIDE: Video Display */}
          <div className="video-container">
            {/* The live video feed appears here */}
            <video
              ref={videoRef}
              className="video-element"
              autoPlay
              playsInline
              muted
            />
            
            {/* Show different placeholders based on current status */}
            
            {/* Before anything starts - show empty state */}
            {status === 'idle' && (
              <div className="video-placeholder">
                <p>Screen will appear here</p>
              </div>
            )}
            
            {/* While waiting for permission - show spinner */}
            {status === 'requesting' && (
              <div className="video-placeholder requesting">
                <div className="spinner"></div>
                <p>Requesting permission...</p>
              </div>
            )}
            
            {/* After stopped - show stopped state */}
            {status === 'stopped' && (
              <div className="video-placeholder stopped">
                <p>Screen share ended</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Information Panel */}
          <div className="info-section">
            
            {/* Status Badge */}
            <div className="status-display">
              <div className="status-badge" data-status={status}>
                {getStatusDisplay()}
              </div>
              
              {/* Show when screen sharing started */}
              {captureTime && (
                <div className="capture-time">
                  Started: {captureTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Screen Information (only shows when capturing) */}
            {deviceInfo && (
              <div className="device-info">
                <h3>Live Stream Information</h3>
                
                {/* "Screen stream active" indicator */}
                <div className="stream-status">
                  <span className="status-indicator active"></span>
                  <span className="status-text">Screen stream active</span>
                </div>
                
                {/* Details about what's being shared */}
                <dl>
                  <dt>Display Type:</dt>
                  <dd>{deviceInfo.displaySurface}</dd>
                  
                  <dt>Resolution:</dt>
                  <dd>{deviceInfo.width} × {deviceInfo.height} px</dd>
                  
                  <dt>Frame Rate:</dt>
                  <dd>{deviceInfo.frameRate ? deviceInfo.frameRate.toFixed(1) : 'N/A'} fps</dd>
                  
                  <dt>Aspect Ratio:</dt>
                  <dd>{deviceInfo.aspectRatio ? deviceInfo.aspectRatio.toFixed(2) : 'N/A'}</dd>
                  
                  <dt>Display Name:</dt>
                  <dd>{deviceInfo.label || 'Unknown'}</dd>
                </dl>
                
                {/* Important note about local preview */}
                
              </div>
            )}

            {/* Error Message (only shows if there's an error) */}
            {errorMessage && (
              <div className={`error-message ${errorMessage.type}`}>
                <p className="error-type">
                  <strong>{formatErrorType(errorMessage.type)}:</strong>
                </p>
                <p className="error-user-message">
                  {errorMessage.userFriendly}
                </p>
                
                {/* Show technical details only in development mode */}
                {process.env.NODE_ENV === 'development' && (
                  <p className="error-technical">Technical: {errorMessage.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          
          {/* STATE 1: Ready to start - show Start button */}
          {status === 'idle' && (
            <Button
              variant="success"
              onClick={startCapture}
              ariaLabel="Start screen capture"
            >
              Start Screen Capture
            </Button>
          )}

          {/* STATE 2: Asking for permission - show loading button */}
          {status === 'requesting' && (
            <Button
              variant="danger"
              onClick={handleBackToHome}
              loading={true}
              ariaLabel="Requesting permission"
            >
              Requesting...
            </Button>
          )}

          {/* STATE 3: Currently capturing or paused - show Pause/Resume and Stop buttons */}
          {(status === 'capturing' || status === 'paused') && (
            <>
              <Button
                variant="warning"
                onClick={togglePause}
                ariaLabel={status === 'capturing' ? 'Pause screen capture' : 'Resume screen capture'}
              >
                {status === 'capturing' ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="danger"
                onClick={stopCapture}
                ariaLabel="Stop screen capture"
              >
                Stop
              </Button>
            </>
          )}

          {/* STATE 4: Stopped, error, cancelled, or denied - show Retry and Back buttons */}
          {(status === 'stopped' || status === 'error' || status === 'cancelled' || status === 'permission_denied') && (
            <>
              <Button
                variant="success"
                onClick={handleRetry}
                ariaLabel="Retry screen capture"
              >
                Retry Screen Test
              </Button>
              <Button
                variant="secondary"
                onClick={handleBackToHome}
                ariaLabel="Go back to home"
              >
                Back to Home
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
