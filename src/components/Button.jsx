import '../styles/Button.css';

/**
 * Reusable Button Component
 * 
 * Use this button throughout the app instead of making custom buttons.
 * It handles styling, loading states, and accessibility.
 * 
 * Example usage:
 * <Button variant="success" onClick={handleStart}>Start</Button>
 * <Button variant="danger" onClick={handleStop}>Stop</Button>
 * <Button loading={true}>Loading...</Button>
 */
export default function Button({
  // What text shows on the button
  children,
  
  // Button style: 'primary', 'secondary', 'danger', 'success', 'warning'
  variant = 'primary',
  
  // Is the button disabled? (grayed out, can't click)
  disabled = false,
  
  // Is the button in loading state? (shows spinner)
  loading = false,
  
  // Function to call when button is clicked
  onClick,
  
  // Extra CSS classes to add
  className = '',
  
  // Label for screen readers (for blind users)
  ariaLabel,
  
  // Any other HTML button properties
  ...otherProps
}) {
  // Button should be disabled if it's disabled OR if it's loading
  // (Can't click a loading button)
  const isDisabled = disabled || loading;

  return (
    <button
      className={`button button-${variant} ${className} ${loading ? 'loading' : ''}`}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...otherProps}
    >
      {loading ? (
        <>
          {/* Show spinner while loading */}
          <span className="button-spinner"></span>
          <span className="button-text">{children}</span>
        </>
      ) : (
        // Show text normally when not loading
        children
      )}
    </button>
  );
}
