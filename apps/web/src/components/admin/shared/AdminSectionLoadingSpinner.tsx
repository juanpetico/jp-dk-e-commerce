import { Loader2 } from 'lucide-react';

interface AdminSectionLoadingSpinnerProps {
    label: string;
}

export default function AdminSectionLoadingSpinner({ label }: AdminSectionLoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="animate-pulse text-muted-foreground">{label}</p>
        </div>
    );
}
