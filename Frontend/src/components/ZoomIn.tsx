import { useLayoutEffect, useRef } from 'react'
import bg from '../assets/Songpage/background.png'
import {gsap} from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AuthComponent } from './'

gsap.registerPlugin(ScrollTrigger);

const ZoomIn = () => {
  const bg1 = useRef<HTMLDivElement | null>(null)
  const image_container = useRef<HTMLDivElement | null>(null)
  const img = useRef<HTMLImageElement | null>(null)
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
        marginTop: -container.current!.offsetHeight + 180
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
      //@ts-ignore
      .to(text1.current, { y : -800 } , 0.05, "<")
      //@ts-ignore
      .to(text2.current, { y : -800 } , 0.08, "<")
      .fromTo(container.current, { yPercent:100, scaleY: 2},
         { yPercent: -20, scaleY: 1})
    })
    return () => ctx.revert();
  })
  return (
    <div className='relative min-h-screen w-screen bg-gradient-to-b from-primary-blue to-[#141414] '>
      <div ref={bg1} className='absolute z-[-1]'>
      </div>
      <section>
        <div ref={image_container} className='zoom-img-container perspective flex items-center justify-center h-screen w-screen  '>
        <img ref={img} className='image h-screen w-screen object-cover absolute z-[-1]' src={bg} alt="" />
          <div className='text-gray-350 absolute inset-0 flex flex-col items-center justify-center text-center'>
          <h1 ref={text1} className='text-[150px] '>
          Dive In. <span className='text-stroke'> Collaborate.</span>
              <span className='text-stroke'> Feel </span> the
              <span className='text-stroke'> Beat.</span>
            </h1>
            <p ref={text2} className='opacity-50 w-48 text-[13px] text-center'>
              {" "}
              Welcome to experiencing music the way it was meant to be</p>
          </div>
        </div>
        <div ref={container} className='last -mt-80 zoom-container flex flex-wrap items-center justify-around '>
          <AuthComponent></AuthComponent>
        </div>
      </section>
    </div>
  )
}

export default ZoomIn