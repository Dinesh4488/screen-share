import { useState, useRef } from 'react';

/**
 * Custom Hook: useScreenShare
 * 
 * This hook helps manage screen sharing functionality.
 * It handles:
 * - Requesting screen capture permission from the user
 * - Displaying the screen in a video element
 * - Showing information about the captured screen
 * - Stopping and restarting the screen share
 * - Cleaning up resources when done
 */
export function useScreenShare() {
  // References to access DOM elements directly
  // videoRef points to the <video> element that displays the screen
  // streamRef stores the actual media stream from the browser
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // State variables track the current situation
  // Think of these as "memory" that React updates and watches
  const [status, setStatus] = useState('idle'); // Current state: idle, requesting, capturing, paused, stopped, cancelled, permission_denied, error
  const [errorMessage, setErrorMessage] = useState(null); // Error info if something goes wrong
  const [stream, setStream] = useState(null); // The actual stream object (for reference)
  const [deviceInfo, setDeviceInfo] = useState(null); // Info about the screen being shared
  const [captureTime, setCaptureTime] = useState(null); // When the recording started

  /**
   * Helper function: Safely stop the screen capture
   * This cleans up all the resource before stopping
   */
  async function stopCapture() {
    try {
      // If a stream is active, stop all its tracks
      if (streamRef.current) {
        // Get all tracks (audio, video) from the stream
        const allTracks = streamRef.current.getTracks();
        
        // Stop each track and remove its event listeners
        allTracks.forEach(track => {
          track.onended = null; // Remove the "on ended" listener
          track.stop(); // Stop the track
        });
        
        streamRef.current = null; // Clear the stream reference
        setStream(null); // Clear the stream state
      }

      // Clear the video element
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Remove video feed
      }

      // Update state to show we stopped
      setStatus('stopped');
      setCaptureTime(null);
      setDeviceInfo(null);
      setErrorMessage(null);

    } catch (error) {
      console.error('Error stopping capture:', error);
      setErrorMessage({
        type: 'stop_error',
        message: error.message,
        userFriendly: 'Failed to stop the screen share.'
      });
      setStatus('error');
    }
  }

  /**
   * Helper function: Extract screen information from the video stream
   */
  function extractScreenInfo(mediaStream) {
    const videoTrack = mediaStream.getVideoTracks()[0];
    
    if (!videoTrack) return null;

    // Get detailed settings about what's being shared
    const settings = videoTrack.getSettings();

    // Convert technical displaySurface names to user-friendly names
    let screenType = 'Unknown';
    if (settings.displaySurface) {
      const typeMap = {
        'monitor': 'Entire Screen',
        'window': 'Window',
        'browser': 'Browser Tab'
      };
      screenType = typeMap[settings.displaySurface] || settings.displaySurface;
    }

    // Return an object with all the screen information
    return {
      displaySurface: screenType,
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      aspectRatio: settings.aspectRatio,
      label: videoTrack.label
    };
  }

  /**
   * Helper function: Handle different types of errors
   */
  function handleError(error) {
    console.error('Screen capture error:', error.name, error.message);

    // Different errors mean different things - explain each one
    if (error.name === 'NotAllowedError') {
      // User said "no" to sharing the screen
      setStatus('permission_denied');
      setErrorMessage({
        type: 'permission_denied',
        message: error.message,
        userFriendly: 'Permission denied. You must allow screen sharing to use this feature.'
      });
    } else if (error.name === 'NotFoundError') {
      // No screen to share (maybe no monitor connected?)
      setStatus('error');
      setErrorMessage({
        type: 'no_display',
        message: error.message,
        userFriendly: 'No display found. Please check if you have a monitor connected.'
      });
    } else if (error.name === 'NotSupportedError') {
      // Browser doesn't support this feature
      setStatus('error');
      setErrorMessage({
        type: 'not_supported',
        message: error.message,
        userFriendly: 'Your browser does not support screen sharing.'
      });
    } else if (error.name === 'AbortError') {
      // User cancelled the screen picker dialog
      setStatus('cancelled');
      setErrorMessage({
        type: 'user_cancelled',
        message: error.message,
        userFriendly: 'You cancelled the screen picker.'
      });
    } else {
      // Some other error we didn't expect
      setStatus('error');
      setErrorMessage({
        type: 'unknown',
        message: error.message,
        userFriendly: 'An unexpected error occurred: ' + error.message
      });
    }

    setCaptureTime(null);
    setDeviceInfo(null);
  }

  /**
   * Main function: Start screen capture
   * This asks the user to pick a screen, then starts showing it
   */
  async function startCapture() {
    try {
      // Clear any previous errors and show we're asking for permission
      setErrorMessage(null);
      setStatus('requesting');
      setCaptureTime(null);

      // Ask the browser to request screen sharing permission from the user
      // This shows the "Pick what to share" dialog
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30 }, // Aim for 30 frames per second
          cursor: 'always' // Always show the cursor
        },
        audio: false // Don't capture audio, just video
      });

      // If we got here, the user allowed it!
      setStatus('capturing');
      setCaptureTime(new Date()); // Remember when we started

      // Save the stream so we can access it later
      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Get info about what the user is sharing
      const screenDetails = extractScreenInfo(mediaStream);
      setDeviceInfo(screenDetails);

      // Show the stream in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Listen for when the user stops sharing (in the browser UI)
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.log('User stopped sharing the screen');
          setStatus('stopped');
          // Cleanup everything
          stopCapture();
        };
      }

    } catch (error) {
      // If something went wrong, handle it
      handleError(error);
    }
  }

  /**
   * Function: Pause or Resume the screen share
   */
  function togglePause() {
    try {
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        
        if (videoTrack) {
          if (status === 'capturing') {
            // Currently showing - so pause it
            videoTrack.enabled = false;
            setStatus('paused');
          } else if (status === 'paused') {
            // Currently paused - so resume it
            videoTrack.enabled = true;
            setStatus('capturing');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      setErrorMessage({
        type: 'toggle_error',
        message: error.message,
        userFriendly: 'Could not pause/resume the screen share.'
      });
      setStatus('error');
    }
  }

  /**
   * Function: Reset everything to get ready for a fresh start
   */
  async function resetCapture() {
    // Stop the current capture if one is running
    if (streamRef.current) {
      await stopCapture();
    }
    
    // Go back to the starting state
    setStatus('idle');
    setErrorMessage(null);
  }

  /**
   * Return everything the component needs to use
   * Components will call these functions and read these states
   */
  return {
    // DOM references (so components can attach to elements)
    videoRef,
    streamRef,

    // Data (so components can display current info)
    status,
    errorMessage,
    stream,
    deviceInfo,
    captureTime,

    // Functions (so components can trigger actions)
    startCapture,
    stopCapture,
    togglePause,
    resetCapture
  };
}
