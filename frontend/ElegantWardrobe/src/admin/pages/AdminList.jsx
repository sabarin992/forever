import React, { useEffect } from 'react'
import api from '../../api'

const AdminList = () => {

  useEffect(()=>{
    try {
      const res = api.get('/')
      console.log(res)
    } catch (error) {
      
    }
  },[])
  return (
    <div>AdminList</div>
  )
}

export default AdminList