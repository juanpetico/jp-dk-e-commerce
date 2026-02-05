'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, X } from 'lucide-react';

interface ImageMagnifierProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({ src, alt, className = '' }) => {
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
        // Only reset if we are not manually zoomed in significantly
        if (zoomLevel <= 1.2) setZoomLevel(1);
    };

    const increaseZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.min(prev + 0.5, 3)); // Max 3x
    };

    const decreaseZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.max(prev - 0.5, 1)); // Min 1x
    };

    const resetZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(1);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => prev === 1 ? 2 : 1);
    };

    const openModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const closeModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };

    // Only pan if we are zoomed in and hovering
    const transformOrigin = isHovering && zoomLevel > 1 ? `${cursorPos.x}% ${cursorPos.y}%` : 'center center';

    return (
        <>
            <div
                ref={containerRef}
                className={`relative overflow-hidden group ${zoomLevel > 1 ? 'cursor-move' : 'cursor-default'} ${className}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <motion.img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain pointer-events-none"
                    animate={{
                        scale: zoomLevel,
                        transformOrigin: transformOrigin
                    }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                />

                {/* Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/70 backdrop-blur-md text-white rounded-full px-3 py-1.5 text-xs font-bold font-mono">
                        {Math.round(zoomLevel * 100)}%
                    </div>

                    <div className="flex bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full shadow-lg overflow-hidden">
                        <button
                            onClick={decreaseZoom}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors"
                            title="Reducir Zoom"
                            disabled={zoomLevel <= 1}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                        <button
                            onClick={resetZoom}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors"
                            title="Restablecer"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                        <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                        <button
                            onClick={increaseZoom}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors"
                            title="Aumentar Zoom"
                            disabled={zoomLevel >= 3}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Fullscreen Modal Trigger (Top Right) */}
                <button
                    onClick={openModal}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 text-black dark:text-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10"
                    title="Ampliar imagen"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <motion.img
                            src={src}
                            alt={alt}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg cursor-default"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageMagnifier;
