import React, { useEffect, useRef, useState,  } from 'react'
import { motion } from 'motion/react';

const Homepage: React.FC = () => {
  
  const mainpage = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const title : string = "TONEDEAF";
  
  useEffect(() => {
    const scrollToMain = () => {
      if(mainpage) {
        mainpage.current?.scrollIntoView();
      }
    }
    const timeout = setTimeout(() => {
      scrollToMain();
      setIsVisible(true);
    }, 3800);
    
    return () => clearTimeout(timeout);
  }, [])

  return (
    <div className={`w-full h-full ${isVisible ? "overflow-y-auto" : "overflow-y-hidden"}`}>
      <div className='homepage_background relative overflow-hidden'>
        <div className='absolute inset-0 w-full h-full'>
          {[...Array(10)].map((_, i) => (
            <span key={i} className='absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full shooting_star animate-shootingStar'></span>
          ))}
        </div>
        <motion.div className='font-Geostar w-full flex justify-center items-center min-h-screen 2xl:text-[220px] lg:text-[140px] md:text-[100px] sm:text-7xl text-5xl 2xl:-translate-y-48'>
          {title.split("").map((c, index) => (
            <motion.span key={index}
              animate={{ y: [400, 0], opacity: [0, 1]}}
              transition={{ duration: 1, delay: index * 0.3, ease: "easeOut" }}
            >{c}</motion.span>
          ))}
        </motion.div>
        <div className='homepage_parallax min-h-screen absolute inset-0' />
        <div className='bg-gradient-to-t from-primary-blue to-transparent min-h-screen absolute inset-0' />
      </div>
      <div ref={mainpage} className='min-h-screen'>
        Homepage
      </div>
    </div>
  )
}

export default Homepage