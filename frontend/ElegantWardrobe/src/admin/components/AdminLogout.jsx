// AdminLogout.jsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ADMIN_ACCESS_TOKEN, ADMIN_REFRESH_TOKEN } from '@/constants';

const AdminLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN);
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default AdminLogout;
