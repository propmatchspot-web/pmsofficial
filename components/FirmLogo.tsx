import React, { useState } from 'react';

interface FirmLogoProps {
    src: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallbackSrc?: string;
}

const FirmLogo: React.FC<FirmLogoProps> = ({ src, alt, size = 'md', className = '', fallbackSrc }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Update state if prop changes
    React.useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
            setHasError(true);
        } else {
            // Ultimate fallback
            setImgSrc('https://placehold.co/100x100/000000/F6AE13?text=' + alt.charAt(0));
        }
    };

    // Define size classes — no padding so logo fills edge-to-edge
    const sizeClasses = {
        sm: 'w-8 h-8',       // Tiny (lists)
        md: 'w-14 h-14',     // Standard (cards)
        lg: 'w-20 h-20',     // Large (headers)
        xl: 'w-32 h-32',     // Extra Large (detail page hero)
    };

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl 
        shrink-0
        ${sizeClasses[size]} 
        ${className}
      `}
        >
            <img
                src={imgSrc}
                alt={alt}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={handleError}
            />
        </div>
    );
};

export default FirmLogo;
