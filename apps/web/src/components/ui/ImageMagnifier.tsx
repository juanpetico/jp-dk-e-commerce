'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, X } from 'lucide-react';

interface ImageMagnifierProps {
    src: string;
    alt: string;
    className?: string;
}

const MagnifierCore: React.FC<ImageMagnifierProps & { disableMaximize?: boolean; onMaximize?: () => void }> = ({ src, alt, className = '', disableMaximize, onMaximize }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isHovering, setIsHovering] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset zoom when image source changes
    useEffect(() => {
        setZoomLevel(1);
    }, [src]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setCursorPos({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        if (zoomLevel <= 1.2) setZoomLevel(1);
    };

    const increaseZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
    };

    const decreaseZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.max(prev - 0.5, 1));
    };

    const resetZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(1);
    };

    const transformOrigin = isHovering && zoomLevel > 1 ? `${cursorPos.x}% ${cursorPos.y}%` : 'center center';

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden group ${zoomLevel > 1 ? 'cursor-move' : 'cursor-default'} ${className} flex items-center justify-center`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative w-fit h-fit max-w-full max-h-full">
                <motion.img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain pointer-events-none block"
                    animate={{
                        scale: zoomLevel,
                        transformOrigin: transformOrigin
                    }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                />
            </div>

            {/* Controls Overlay - Moved to container corners */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                <div className="bg-black/70 text-white rounded px-2 py-1 text-xs font-mono">
                    {Math.round(zoomLevel * 100)}%
                </div>

                <div className="flex bg-white/90 dark:bg-black/90 rounded border border-gray-200 dark:border-gray-800 shadow-sm">
                    <button
                        onClick={decreaseZoom}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors disabled:opacity-30 border-r border-gray-200 dark:border-gray-700"
                        title="Reducir Zoom"
                        disabled={zoomLevel <= 1}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={resetZoom}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors border-r border-gray-200 dark:border-gray-700"
                        title="Restablecer"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                        onClick={increaseZoom}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors disabled:opacity-30"
                        title="Aumentar Zoom"
                        disabled={zoomLevel >= 3}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Fullscreen Button - Moved to container corners */}
            {!disableMaximize && onMaximize && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMaximize();
                    }}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 text-black dark:text-white p-1.5 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 z-20 transition-all border border-gray-200 dark:border-gray-800"
                    title="Ampliar imagen"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({ src, alt, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <MagnifierCore src={src} alt={alt} className={className} onMaximize={openModal} />

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeModal();
                            }}
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-50"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="w-full h-full flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <MagnifierCore
                                src={src}
                                alt={alt}
                                disableMaximize
                                className="max-w-full max-h-[85vh]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


export default ImageMagnifier;

