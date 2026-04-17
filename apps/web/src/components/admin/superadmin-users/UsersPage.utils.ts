export const formatUsersDate = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
