import React, { useRef, useState } from 'react'

const TimerComponent = () => {
    const [timer,setTimer] = useState(0)
    const intervalId = useRef(null)


   const startTimer = ()=>{
    intervalId.current = setInterval(()=>{
        setTimer((prevTime) => prevTime + 1)
    },1000)
   };
   
   const stopTimer = ()=>{
        clearInterval(intervalId.current)
   }
   const resetTimer = ()=>{
    stopTimer();
    setTimer(0);
   }
  return (
    <div>
        <p>Timer :{timer}</p>
       <div className='flex gap-3'>
       <button className='border p-1' onClick = {()=>{startTimer()}}>start</button>
        <button className='border p-1' onClick = {()=>{stopTimer()}}>stop</button>
        <button className='border p-1' onClick = {()=>{resetTimer()}}>reset</button>
       </div>
    </div>
  )
}

export default TimerComponent