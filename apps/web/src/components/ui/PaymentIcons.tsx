import React from 'react';

export const MercadoPagoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#009EE3" />
        <path d="M8.5 13.5C8.5 13.5 10 11 12 12.5C14 11 15.5 13.5 15.5 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8V12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12.5V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.5 13.5H9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 13.5H16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const WebpayIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5Z" fill="#F8F8F8" stroke="#E5E7EB" />
        <path d="M12 17L15.3 7H13.1L11.1 14.2L9.1 7H6.9L10.2 17H12Z" fill="#FF4500" />
        <path d="M16 17V11H18V17H16Z" fill="#717171" />
        <path d="M16 9C16.8284 9 17.5 8.32843 17.5 7.5C17.5 6.67157 16.8284 6 16 6C15.1716 6 14.5 6.67157 14.5 7.5C14.5 8.32843 15.1716 9 16 9Z" fill="#FF4500" />
    </svg>
);

export const PayPalIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M15.5 10C17.5 10 19 8.5 19 6.5C19 4.5 17.5 3 15.5 3H8.5L5.5 21H9.5L10.5 15H13.5C16.5 15 18 13 18 10.5C18 10.5 18 10 15.5 10Z" fill="#003087" />
        <path d="M15.5 10C15.5 10 16.5 10 16.5 7C16.5 5 15.5 4 14 4H10L8.5 14H11.5L12 10H14.5C15 10 15.5 10 15.5 10Z" fill="#009CDE" />
        <path d="M9.5 21L10.5 15H13.5C14 15 15 14.5 15 13C15 13 15 13 13.5 13H11.5L10.5 21H9.5Z" fill="#003087" />
    </svg>
);
