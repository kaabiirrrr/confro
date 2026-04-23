import { Navigate, useLocation } from 'react-router-dom';

/**
 * AdminRoute - Protects admin routes on the frontend.
 * Checks for adminToken in localStorage and verifies user role.
 */
const AdminRoute = ({ children }) => {
    const location = useLocation();
    const adminToken = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Basic role check - in a production app, we would verify the token against the backend
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR' || user.role === 'FINANCE_ADMIN' || user.role === 'SUPPORT_ADMIN';

    if (!adminToken || !isAdmin) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
