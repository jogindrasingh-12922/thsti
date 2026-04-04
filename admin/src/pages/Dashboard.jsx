import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';

export default function Dashboard() {
    const userStr = localStorage.getItem('thsti_admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const [summary, setSummary] = useState({ totalMenus: '--', activePages: '--', mediaFiles: '--' });

    useEffect(() => {
        api.get('/dashboard/summary')
            .then(res => setSummary(res.data))
            .catch(err => console.error('Failed to load dashboard summary', err));
    }, []);

    return (
        <AdminPageLayout title="Dashboard Overview" subtitle="Quick overview of your CMS statistics">
            <div className="flex flex-col space-y-6 min-h-0 flex-1 overflow-auto">
                <div className="flex justify-between items-center bg-secondary text-white p-6 rounded-md shadow-md">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Admin'}</h1>
                        <p className="text-gray-300 mt-2">Here is a quick overview of your CMS.</p>
                    </div>
                    <div className="bg-primary px-4 py-2 rounded-md font-bold uppercase tracking-wider">
                        Role: {user?.role || 'VIEWER'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="admin-card p-6 border-t-4 border-t-accent bg-white shadow-sm">
                        <h3 className="text-lg font-bold text-secondary mb-2 uppercase tracking-wide">Total Menus</h3>
                        <p className="text-4xl font-bold text-primary">{summary.totalMenus}</p>
                    </div>
                    <div className="admin-card p-6 border-t-4 border-t-secondary bg-white shadow-sm">
                        <h3 className="text-lg font-bold text-secondary mb-2 uppercase tracking-wide">Active Pages</h3>
                        <p className="text-4xl font-bold text-primary">{summary.activePages}</p>
                    </div>
                    <div className="admin-card p-6 border-t-4 border-t-primary bg-white shadow-sm">
                        <h3 className="text-lg font-bold text-secondary mb-2 uppercase tracking-wide">Media Files</h3>
                        <p className="text-4xl font-bold text-primary">{summary.mediaFiles}</p>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
