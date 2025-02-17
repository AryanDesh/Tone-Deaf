"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"

gsap.registerPlugin(CustomEase)

const OsmoMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    CustomEase.create("main", "0.65, 0.01, 0.05, 0.99")
    gsap.defaults({
      ease: "main",
      duration: 0.7,
    })

    const tl = gsap.timeline()

    const openNav = () => {
      tl.clear()
        .set(".nav", { display: "block" })
        .set(".menu", { xPercent: 0 }, "<")
        .fromTo(".menu-button p", { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
        .fromTo(".menu-button-icon", { rotate: 0 }, { rotate: 315 }, "<")
        .fromTo(".overlay", { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
        .fromTo(".bg-panel", { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
        .fromTo(".menu-link", { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35")
        .fromTo(
          "[data-menu-fade]",
          { autoAlpha: 0, yPercent: 50 },
          { autoAlpha: 1, yPercent: 0, stagger: 0.04 },
          "<+=0.2",
        )
    }

    const closeNav = () => {
      tl.clear()
        .to(".overlay", { autoAlpha: 0 })
        .to(".menu", { xPercent: 120 }, "<")
        .to(".menu-button p", { yPercent: 0 }, "<")
        .to(".menu-button-icon", { rotate: 0 }, "<")
        .set(".nav", { display: "none" })
    }

    if (isOpen) {
      openNav()
    } else {
      closeNav()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  return (
    <div className="osmo-ui">
      <header className="header">
        <div className="container is--full">
          <nav className="flex justify-between items-center">
            <a
              href="https://osmo.supply/"
              aria-label="home"
              target="_blank"
              className="flex items-center"
              rel="noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="66"
                viewBox="0 0 66 20"
                fill="none"
                className="text-current"
              >
                {/* SVG paths for logo */}
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="160"
                viewBox="0 0 160 160"
                fill="none"
                className="text-current ml-2"
              >
                {/* SVG path for icon */}
              </svg>
            </a>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
              <div className="mr-2">
                <p className="text-lg">{isOpen ? "Close" : "Menu"}</p>
              </div>
              <div className="w-6 h-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-full h-full transform transition-transform duration-700 ease-main"
                >
                  {/* SVG paths for menu icon */}
                </svg>
              </div>
            </button>
          </nav>
        </div>
      </header>

      <div className={`nav fixed inset-0 ${isOpen ? "block" : "hidden"}`}>
        <div className="overlay absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
        <nav className="menu absolute right-0 top-0 bottom-0 w-full max-w-md bg-white">
          <div className="menu-bg relative h-full">
            <div className="bg-panel absolute inset-0 bg-gray-100"></div>
            <div className="bg-panel absolute inset-0 bg-gray-200"></div>
            <div className="bg-panel absolute inset-0 bg-gray-300"></div>
          </div>
          <div className="menu-inner relative h-full p-8 flex flex-col justify-between">
            <ul className="menu-list space-y-6">
              {["About us", "Our work", "Services", "Blog", "Contact us"].map((item, index) => (
                <li key={item} className="menu-list-item">
                  <a href="#" className="menu-link block relative overflow-hidden">
                    <p className="menu-link-heading text-2xl font-bold">{item}</p>
                    <p className="eyebrow text-sm text-gray-500">0{index + 1}</p>
                    <div className="menu-link-bg absolute inset-0 bg-gray-100 transform translate-y-full transition-transform duration-300 ease-main"></div>
                  </a>
                </li>
              ))}
            </ul>
            <div className="menu-details">
              <p data-menu-fade="" className="text-sm mb-4">
                Socials
              </p>
              <div className="socials-row grid grid-cols-2 gap-4">
                {["Instagram", "LinkedIn", "X/Twitter", "Awwwards"].map((social) => (
                  <a key={social} data-menu-fade="" href="#" className="text-lg hover:underline">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default OsmoMenu

