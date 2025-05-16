import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"

// Define the menu items type
type MenuItem = {
  title: string
  url: string
  number: string
}

// Menu items data
const menuItems: MenuItem[] = [
  { title: "songs", url: "#", number: "01" },
  { title: "collaborate", url: "/PlayList", number: "02" },
  { title: "friends", url: "#", number: "03" },
  { title: "playlists", url: "#", number: "04" },
  { title: "about", url: "#", number: "05" },
  { title: "contact" , url: "#", number: "06"}
]

// Social links data
const socialLinks = [
  { title: "Instagram", url: "#" },
  { title: "LinkedIn", url: "#" },
  { title: "X/Twitter", url: "#" },
  { title: "Awwwards", url: "#" },
]

interface MenuProps {
  activePage: string
  setActivePage: (page: string) => void
}

const Menu: React.FC<MenuProps> = ({ setActivePage }) => {
  const navRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const bgPanelsRef = useRef<HTMLDivElement[]>([])
  const menuLinksRef = useRef<HTMLAnchorElement[]>([])
  const fadeTargetsRef = useRef<HTMLElement[]>([])
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonTextsRef = useRef<HTMLParagraphElement[]>([])
  const menuButtonIconRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline>()

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(CustomEase)

    // Create custom ease
    CustomEase.create("main", "0.65, 0.01, 0.05, 0.99")

    // Set GSAP defaults
    gsap.defaults({
      ease: "main",
      duration: 0.7,
    })

    // Set initial state
    if (navRef.current) {
      gsap.set(navRef.current, { display: "none" })
    }

    // Create timeline
    tlRef.current = gsap.timeline()

    // Add event listeners for escape key
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && navRef.current?.getAttribute("data-nav") === "open") {
      closeNav()
    }
  }

  const openNav = () => {
    if (!navRef.current) return

    navRef.current.setAttribute("data-nav", "open")

    tlRef.current
      ?.clear()
      .set(navRef.current, { display: "block" })
      .set(menuRef.current, { xPercent: 0 }, "<")
      .fromTo(menuButtonTextsRef.current, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
      .fromTo(menuButtonIconRef.current, { rotate: 0 }, { rotate: 315 }, "<")
      .fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(bgPanelsRef.current, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
      .fromTo(menuLinksRef.current, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35")
      .fromTo(
        fadeTargetsRef.current,
        { autoAlpha: 0, yPercent: 50 },
        { autoAlpha: 1, yPercent: 0, stagger: 0.04 },
        "<+=0.2",
      )
  }

  const closeNav = () => {
    if (!navRef.current) return

    navRef.current.setAttribute("data-nav", "closed")

    tlRef.current
      ?.clear()
      .to(overlayRef.current, { autoAlpha: 0 })
      .to(menuRef.current, { xPercent: 120 }, "<")
      .to(menuButtonTextsRef.current, { yPercent: 0 }, "<")
      .to(menuButtonIconRef.current, { rotate: 0 }, "<")
      .set(navRef.current, { display: "none" })
  }

  const toggleNav = () => {
    const state = navRef.current?.getAttribute("data-nav")
    if (state === "open") {
      closeNav()
    } else {
      openNav()
    }
  }

  return (
    <>
      <div className="z-0 pointer-events-none flex flex-col justify-between items-stretch">
        <header className="z-[110] pt-6 fixed inset-[0%_0%_auto]">
          <div className="z-20 max-w-full px-4 sm:px-6 w-full mx-auto relative">
            <nav className="justify-start items-center w-full flex">
              <div className="justify-end items-center flex pointer-events-auto">
                <button
                  ref={menuButtonRef}
                  role="button"
                  onClick={toggleNav}
                  className="gap-2.5 bg-red justify-end items-center -m-4 p-4 flex border-none"
                >
                  <div className="flex flex-col justify-start items-end h-[1.125em] overflow-hidden text-white">
                    <p
                      ref={(el) => (menuButtonTextsRef.current[0] = el as HTMLParagraphElement)}
                      className="text-[1.125em] font-sans m-0 "
                    >
                      TONEDEAF
                    </p>
                    <p
                      ref={(el) => (menuButtonTextsRef.current[1] = el as HTMLParagraphElement)}
                      className="text-[1.125em] font-sans m-0"
                    >
                      TONES
                    </p>
                  </div>
                  <div className="transition-transform duration-400 ease-\[cubic-bezier\(0.65,0.05,0,1\)\] hover:rotate-90">
                    <svg
                      ref={menuButtonIconRef}
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-4 h-4"
                    >
                      <path
                        d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                        fill="white"
                      ></path>
                      <path
                        d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                        fill="white"
                      ></path>
                      <path
                        d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z"
                        fill="white"
                      ></path>
                      <path
                        d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z"
                        fill="white"
                      ></path>
                      <path
                        d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z"
                        fill="white"
                      ></path>
                      <path
                        d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z"
                        fill="white"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>
        <div ref={navRef} data-nav="closed" className="z-[100] w-full h-screen mx-auto fixed inset-0">
          <div
            ref={overlayRef}
            onClick={toggleNav}
            className="z-0 cursor-pointer bg-[#13131366] w-full h-full absolute inset-0"
          ></div>

          <nav
            ref={menuRef}
            className="pb-8 gap-20 pt-24 flex flex-col justify-between  items-start w-[74dvw] md:w-[35em] h-full ml-auto relative overflow-auto"
          >
            <div className="z-0 absolute inset-0">
              <div
                ref={(el) => (bgPanelsRef.current[0] = el as HTMLDivElement)}
                className="z-0 bg-primary rounded-l-[1.25em] absolute inset-0"
              ></div>
              <div
                ref={(el) => (bgPanelsRef.current[1] = el as HTMLDivElement)}
                className="z-0 bg-neutral-100 rounded-l-[1.25em] absolute inset-0"
              ></div>
              <div
                ref={(el) => (bgPanelsRef.current[2] = el as HTMLDivElement)}
                className="z-0 bg-neutral-300 rounded-l-[1.25em] absolute inset-0"
              ></div>
            </div>

            <div className="z-1 gap-20 flex flex-col justify-between items-start h-full relative overflow-auto">
              <ul className="flex flex-col w-full mb-0 pl-0 list-none">
                {menuItems.map((item, index) => (
                  <li key={index} className="relative overflow-hidden md:h-auto">
                    <a
                      ref={(el) => (menuLinksRef.current[index] = el as HTMLAnchorElement)}
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        setActivePage(item.title);
                      }}
                      className="py-3 pl-4 md:pl-8 w-full text-decoration-none flex group relative"
                    >
                      {/* Background overlay effect */}
                      <div className="absolute inset-0 bg-black scale-y-0 opacity-0 transition-all duration-500 ease-in-out group-hover:scale-y-100 group-hover:opacity-100"></div>

                      {/* Menu Text */}
                      <p className="z-10 uppercase font-bold text-4xl text-black md:text-[4em] leading-[0.75] transition-all duration-500 ease-in-out  group-hover:text-white relative">
                        {item.title}
                      </p>

                      {/* Menu Number */}
                      <p className="z-10 text-primary uppercase font-mono font-normal transition-all duration-500 ease-in-out group-hover:text-white relative">
                        {item.number}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>


              <div className="pl-4 md:pl-8 gap-5 flex flex-col justify-start items-start">
                <p
                  ref={(el) => (fadeTargetsRef.current[0] = el as HTMLElement)}
                  data-menu-fade=""
                  className="text-sm font-sans"
                >
                  Socials
                </p>
                <div className="gap-6 md:gap-6 flex flex-row">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      ref={(el) => (fadeTargetsRef.current[index + 1] = el as HTMLElement)}
                      data-menu-fade=""
                      href={link.url}
                      className="text-[1.125em] font-sans no-underline relative group"
                    >
                      <span>{link.title}</span>
                      <span className="absolute left-0 bottom-0 w-full h-[1px] bg-primary origin-right scale-x-0 transition-transform duration-400 ease-[cubic-bezier(0.65,0.05,0,1)] group-hover:origin-left group-hover:scale-x-100"></span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
    </>
  )
}

export default Menu;