import React from 'react';

export const ThreeDScrollTriggerContainer = ({ children, className = "" }) => {
    return (
        <div className={`w-full overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export const ThreeDScrollTriggerRow = ({ children, baseVelocity = 2, className = "" }) => {
    // Determine scrolling direction and speed
    const isRight = baseVelocity > 0;
    const duration = Math.abs(60 / baseVelocity); // Dynamic speed based on velocity

    // Inline styling for the scrolling animation
    const animationStyle = `
    @keyframes marqueeScrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes marqueeScrollRight {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
  `;

    return (
        <div className={`w-full overflow-hidden relative flex ${className}`}>
            <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

            {/* Flex container holding duplicated tracks for continuous seamless loop */}
            <div
                className="flex whitespace-nowrap"
                style={{
                    animation: `${isRight ? 'marqueeScrollRight' : 'marqueeScrollLeft'} ${duration}s linear infinite`,
                    width: 'max-content'
                }}
            >
                {/* Track part 1 */}
                <div className="flex">
                    {children}
                </div>
                {/* Track part 2 (Duplicated for seamless transition) */}
                <div className="flex" aria-hidden="true">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ThreeDScrollTriggerRow;
