// AdminLogout.jsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
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
