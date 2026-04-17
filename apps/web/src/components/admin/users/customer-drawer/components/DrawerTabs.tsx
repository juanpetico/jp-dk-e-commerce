import React from 'react';
import { Button } from '@/components/ui/Button';
import { TABS } from '../constants';
import { DrawerTab } from '../types';

interface DrawerTabsProps {
    activeTab: DrawerTab;
    onChange: (tab: DrawerTab) => void;
}

export function DrawerTabs({ activeTab, onChange }: DrawerTabsProps) {
    return (
        <div className="flex shrink-0 gap-2 border-b border-border px-5 pb-3 pt-4">
            {TABS.map((tab) => (
                <Button
                    key={tab.key}
                    type="button"
                    size="sm"
                    variant={activeTab === tab.key ? 'default' : 'outline'}
                    onClick={() => onChange(tab.key)}
                    className="flex items-center gap-1.5"
                >
                    {tab.icon}
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}
