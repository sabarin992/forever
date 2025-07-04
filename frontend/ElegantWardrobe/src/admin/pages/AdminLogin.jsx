// AdminLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import api from '@/api';
import { ACCESS_TOKEN, ADMIN_TOKEN } from '@/constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = ()=> {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    console.log(email,password);
    
    e.preventDefault();
    try {
      const response = await api.post('/admin_login/', {
        email,
        password,
      });
      setError('')
      localStorage.setItem(ADMIN_TOKEN, response.data.access);
      toast.success('Admin logged in successfully');
      navigate('/admin')
      // Navigate to admin dashboard here
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form
    onSubmit={handleLogin}

      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Admin Login</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {error?<p className='text-red-700 w-full'>{error}</p>:null}
      <input
      onChange={(e)=>{setEmail(e.target.value)}}
        className="w-full px-3 py-2 border border-gray-800"
        type="email"
        placeholder="Email"
        required
      />

      <div className="relative w-full">
        <input
          onChange={(e)=>{setPassword(e.target.value)}}
          className="w-full px-3 py-2 border border-gray-800 pr-10"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      <button className="bg-black text-white px-8 py-2 font-light mt-4 ">
        Login
      </button>
      
    </form>
  );
}

export default AdminLogin;

// // AdminLogin.jsx
// import React, { useState } from 'react';
// import axios from 'axios';
// import api from '@/api';
// import { ACCESS_TOKEN, ADMIN_TOKEN } from '@/constants';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const AdminLogin = ()=> {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate()

//   const handleLogin = async (e) => {
//     console.log(email,password);
    
//     e.preventDefault();
//     try {
//       const response = await api.post('/admin_login/', {
//         email,
//         password,
//       });
//       setError('')
//       localStorage.setItem(ADMIN_TOKEN, response.data.access);
//       toast.success('Admin logged in successfully');
//       navigate('/admin')
//       // Navigate to admin dashboard here
//     } catch (err) {
//       setError(err.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <form
//     onSubmit={handleLogin}

//       className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
//     >
//       <div className="inline-flex items-center gap-2 mb-2 mt-10">
//         <p className="prata-regular text-3xl">Admin Login</p>
//         <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
//       </div>
//       {error?<p className='text-red-700 w-full'>{error}</p>:null}
//       <input
//       onChange={(e)=>{setEmail(e.target.value)}}
//         className="w-full px-3 py-2 border border-gray-800"
//         type="email"
//         placeholder="Email"
//         required
//       />

//       <input
//         onChange={(e)=>{setPassword(e.target.value)}}
//         className="w-full px-3 py-2 border border-gray-800"
//         type="password"
//         placeholder="Password"
//         required
//       />
//       {/* <div className="w-full flex justify-between text-sm mt-[-8px]">
//         <p className="cursor-pointer">Forgot your Password?</p>

//         <p className="cursor-pointer">Create Account</p>
//       </div> */}
//       <button className="bg-black text-white px-8 py-2 font-light mt-4 ">
//         Login
//       </button>
      
//     </form>
//     // <form onSubmit={handleLogin}>
//     //   <input
//     //     type="text"
//     //     value={username}
//     //     onChange={(e) => setUsername(e.target.value)}
//     //     placeholder="Admin Username"
//     //     required
//     //   />
//     //   <input
//     //     type="password"
//     //     value={password}
//     //     onChange={(e) => setPassword(e.target.value)}
//     //     placeholder="Password"
//     //     required
//     //   />
//     //   <button type="submit">Login</button>
//     //   {error && <p style={{ color: 'red' }}>{error}</p>}
//     // </form>
//   );
// }

// export default AdminLogin;
