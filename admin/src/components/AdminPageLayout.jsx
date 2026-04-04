import React from 'react';

export default function AdminPageLayout({ title, subtitle, actionButtons, actions, children }) {
    const renderActions = actionButtons || actions;

    return (
        <div className="flex flex-col space-y-6">
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-light pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-secondary uppercase tracking-tight">{title}</h2>
                    {subtitle && <p className="text-text-muted mt-1">{subtitle}</p>}
                </div>
                {renderActions && (
                    <div className="flex flex-wrap items-center gap-3 print:hidden">
                        {renderActions}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
