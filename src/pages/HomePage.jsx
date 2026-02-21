import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/HomePage.css';

/**
 * HomePage Component
 * 
 * This is the landing page that:
 * 1. Checks if the browser supports screen sharing
 * 2. Shows appropriate message based on support status
 * 3. Lets user click to start the screen test
 */
export default function HomePage() {
  // Function to navigate to different pages
  const navigate = useNavigate();
  
  // Track browser support status
  // null = checking, true = supported, false = not supported
  const [isSupported, setIsSupported] = useState(null);
  
  // Store error message if checking fails
  const [error, setError] = useState(null);

  /**
   * useEffect: Check browser support when page loads
   * This runs once when component first appears
   */
  useEffect(() => {
    function checkBrowserSupport() {
      try {
        // Check if browser has the getDisplayMedia function
        // This is what lets us capture the screen
        const hasSupport = !!(
          navigator.mediaDevices &&
          navigator.mediaDevices.getDisplayMedia
        );

        if (hasSupport) {
          // Browser supports screen sharing
          setIsSupported(true);
          setError(null);
        } else {
          // Browser doesn't support screen sharing
          setIsSupported(false);
          setError('Your browser does not support screen sharing.');
        }
      } catch (err) {
        // Error while checking support
        setIsSupported(false);
        setError('Error checking browser support: ' + err.message);
      }
    }

    // Run the check
    checkBrowserSupport();
  }, []); // Empty array = run only once on page load

  /**
   * When user clicks "Start Screen Test"
   * Navigate to the test page (if browser supports it)
   */
  function handleStartTest() {
    if (isSupported) {
      navigate('/screen-test');
    }
  }

  // ===== RENDER =====
  return (
    <div className="homepage-container">
      {/* Page Header */}
      <header className="homepage-header">
        <h1>Screen Share Test App</h1>
      </header>

      {/* Main Content */}
      <main className="homepage-main">
        
        {/* WHILE CHECKING - Show loading message */}
        {isSupported === null && (
          <div className="support-checking">
            <p>Checking browser support...</p>
          </div>
        )}

        {/* BROWSER NOT SUPPORTED - Show error message */}
        {isSupported === false && (
          <div className="support-error">
            <p className="error-title">⚠️ Browser Not Supported</p>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* BROWSER SUPPORTED - Show start button */}
        {isSupported === true && (
          <div className="support-success">
            <p className="success-title">✓ Screen Sharing Supported</p>
            <p className="success-message">
              Your browser supports screen sharing. Click the button below to start the test.
            </p>
            <button 
              className="start-button"
              onClick={handleStartTest}
              aria-label="Start screen share test"
            >
              Start Screen Test
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
