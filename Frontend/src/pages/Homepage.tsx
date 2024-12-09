import React, { useEffect, useState,  } from 'react'

const Homepage: React.FC = () => {
  
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 3800);
    
    return () => clearTimeout(timeout);
  }, [])

  if(!isVisible) {
    return (
      <div className='homepage_background min-h-screen animate-lift'>
        <p className='font-Geostar w-full flex justify-center min-h-screen text-[280px] fixed shadow-2xl '>Tone Deaf</p>
        <div className='homepage_parallax min-h-screen absolute inset-0' />
        <div className='bg-gradient-to-t from-primary-blue to-transparent min-h-screen absolute inset-0' />
      </div>
    )
  }

  return (
    <div className='w-full h-full'>
      <div className='min-h-screen'>
        Homepage
      </div>
    </div>
  )
}

export default Homepage