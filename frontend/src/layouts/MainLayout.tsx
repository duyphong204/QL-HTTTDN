import { Sidebar } from '@/components/sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};
