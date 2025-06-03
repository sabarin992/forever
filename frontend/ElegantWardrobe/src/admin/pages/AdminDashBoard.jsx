// Example parent component
import React, { useEffect, useState } from 'react';
import SalesReport from './SalesReport';
import BestSellingProducts from '../components/BestSellingProducts';
import api from '@/api';
import BestSellingCategories from '../components/BestSellingCategories';

const AdminDashboard = () => {
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    api.get('/best_selling_products/').then(res => {
      setProductData(res.data);
    });
  }, []);

  return (
    <>
      <SalesReport/>
      <BestSellingProducts/>
      <BestSellingCategories/>
    </>
  );
};

export default AdminDashboard;
