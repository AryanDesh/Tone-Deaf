"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Music, Users, Headphones, Globe } from "lucide-react"

const AboutPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
  
    const ctx = gsap.context(() => {

      gsap.from(pageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      })
      
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      })
      
      gsap.from(featuresRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      })
      
      gsap.from(teamRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        ease: "power3.out",
      })
    })
    return () => ctx.revert();
    }, [])
    
  // Team members data
  const teamMembers = [
    { name: "Alex Johnson", role: "Founder & CEO", avatar: "/placeholder.svg?height=200&width=200" },
    { name: "Sarah Williams", role: "Lead Developer", avatar: "/placeholder.svg?height=200&width=200" },
    { name: "Michael Chen", role: "UX Designer", avatar: "/placeholder.svg?height=200&width=200" },
    { name: "Emma Davis", role: "Music Curator", avatar: "/placeholder.svg?height=200&width=200" },
  ]

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      <div ref={heroRef} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              About ToneDeaf
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              ToneDeaf is a revolutionary music platform designed to bring people together through the power of music.
              Our mission is to create a seamless, collaborative music experience that connects artists, listeners, and
              friends in new and exciting ways.
            </p>
            <p className="text-gray-300">
              Founded in 2023, we've grown from a small startup to a vibrant community of music lovers who share,
              discover, and create together.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
              <img src="/placeholder.svg?height=400&width=600" alt="ToneDeaf Team" className="object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div ref={featuresRef} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-bold mb-6">Our Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Music size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Personalized Music</h3>
            <p className="text-gray-300">
              Discover new music tailored to your unique taste with our advanced recommendation engine.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="bg-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Collaborative Playlists</h3>
            <p className="text-gray-300">
              Create and share playlists with friends, allowing everyone to contribute their favorite tracks.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Headphones size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">High-Quality Audio</h3>
            <p className="text-gray-300">
              Experience your music in stunning clarity with our high-definition audio streaming technology.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Globe size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Community</h3>
            <p className="text-gray-300">
              Connect with music lovers from around the world and expand your musical horizons.
            </p>
          </div>
        </div>
      </div>

      <div ref={teamRef} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img src={member.avatar || "/placeholder.svg"} alt={member.name}  className="object-cover" />
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-purple-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AboutPage

