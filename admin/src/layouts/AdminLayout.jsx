import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
    const token = localStorage.getItem('thsti_admin_token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-bg-light font-sans text-text-main overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                <header className="bg-white border-b border-border-light h-16 shrink-0 flex items-center px-8 shadow-sm">
                    <h2 className="text-xl font-bold text-secondary">Content Management System</h2>
                </header>
                <main className="p-8 flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0 bg-bg-light">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
