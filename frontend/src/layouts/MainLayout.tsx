import { Outlet } from 'react-router-dom';
// import AdminLayout from './AdminLayout';

export const MainLayout = () => {
    return (
        <div className="flex h-screen">
            {/* <AdminLayout /> */}
            <main className="flex-1 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};
