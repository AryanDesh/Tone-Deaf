import React, { useLayoutEffect, useRef } from 'react'
import bg from '../assets/Songpage/background.png'
import {gsap} from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { transform } from 'motion';

gsap.registerPlugin(ScrollTrigger);

const ZoomIn = () => {
  const bg1 = useRef<HTMLDivElement | null>(null)
  const image_container = useRef<HTMLDivElement | null>(null)
  const img = useRef<HTMLDivElement | null>(null)
  const text1 = useRef<HTMLDivElement | null>(null)
  const text2 = useRef<HTMLDivElement | null>(null)
  const container= useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger : bg1.current,
        pin:bg1.current,
        pinSpacing: false,
        start: "top top" ,
        endTrigger: ".last",
        end: "bottom bottom",
      });

      gsap.set(container.current, {
        marginTop: -container.current!.offsetHeight
      })

      gsap.timeline({
        scrollTrigger:{
          trigger:image_container.current,
          pin:image_container.current,
          scrub: 1,
          start: "0% 0%",
        }
      })
      .to(img.current, { transform: "translateZ(2200px)"}, 0)
      .to(text1.current, { y : -800 } , 0.05, "<")
      .to(text2.current, { y : -800 } , 0.08, "<")
      .fromTo(container.current, { yPercent:100, scaleY: 2},
         { yPercent: 0, scaleY: 0})
    })
    return () => ctx.revert();
  })
  return (
    <div className='relative '>
      <div ref={bg1} className='absolute h-screen w-screen bg-gradient-to-b from-primary-blue to-[#141414] z-[-1]'>
      </div>
      <section>
        <div ref={image_container} className='zoom-img-container perspective flex items-center justify-center h-screen w-screen '>
          <img ref={img} className='image h-screen' src={bg} alt="" />
          <div className='text-white absolute flex flex-col items-center justify-center'>
            <h1 ref={text1} className='text-[150px] '>
              <span className='text-stroke'>SCROLL TO</span> ENTER
            </h1>
            <p ref={text2} className='opacity-50 w-48 text-[13px] text-center'>
              {" "}
              Welcome to experiencing music the way it was meant to be</p>
          </div>
        </div>
        <div ref={container} className='zoom-container py-12 flex flex-wrap items-center justify-around '>
          <div className='col-1 flex flex-col gap-16 '>
            <img className='w-[450px] h-[350px] translate-y-[30%] ' src={bg}  />
            < img className='w-[400px] h-[400px] translate-y-[30%] ' src={bg}  />
          </div>
          <div className='col-2 flex flex-col gap-16 '>
            < img className='w-[600px] h-[350px] translate-y-[30%]' src={bg}  />
            < img className='w-[450px] h-[350px] translate-y-[30%] last' src={bg}  />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ZoomIn