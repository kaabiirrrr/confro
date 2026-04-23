import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Basic role check - in a production app, we would verify the token against the backend
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN'].includes(user.role);

    if (!token || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
