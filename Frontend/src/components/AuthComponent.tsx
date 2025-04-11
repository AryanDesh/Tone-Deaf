"use client"

import type React from "react"
import { useState, useRef } from "react"
import "../styles/card.css"
import axios from "axios";
import { useNavigate } from "react-router";


const AuthComponent: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true)
  const passRef = useRef<HTMLInputElement>(null);
  const passconfRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  const SignIn = async (event: React.FormEvent) => {
    event.preventDefault(); 1
  
    if (!emailRef.current || !passRef.current) return;
  
    const email = emailRef.current.value;
    const password = passRef.current.value;
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login/", 
        { email, password },
        { withCredentials: true } 
      );
  
      //@ts-ignore
      alert(response.data?.message); 

      navigate("/main");
    } catch (error: any) {
      if (error.response) {
        alert(error.response.data.message); // Show error message from backend
      } else {
        alert("An error occurred while signing in");
      }
    }
  }
    
  const SignUp = async (event: React.FormEvent) => {
    event.preventDefault(); 
  
    if (!emailRef.current || !passRef.current || !passconfRef.current || !nameRef.current ) return;

    if(passRef.current.value != passconfRef.current.value) return;
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passRef.current.value;
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/signup/", 
        { username: name, email, password },
        { withCredentials: true } 
      );
  
      //@ts-ignore
      alert(response.data?.message); 
      navigate("/main");

    } catch (error: any) {
      if (error.response) {
        alert(error.response.data); 
      } else {
        alert("An error occurred while signing up");
      }
    }
  }

  return (
    <div className="card">
      <div className="inner-content w-full h-full flex flex-col justify-center items-center p-6 bg-black/50 backdrop-blur-md rounded-lg">
        <div className="flex justify-center items-center mb-6">
          <button
            className={`mr-2 px-4 py-2 rounded-md ${
              isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              !isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={isSignUp ? SignUp : SignIn} className="space-y-4 w-full max-w-sm">
        {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Name
              </label>
              <input
                ref={nameRef}
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <input
              ref={passRef}
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                Confirm Password
              </label>
              <input
                ref={passconfRef}
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full px-3 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => {setIsSignUp(!isSignUp)}} className="text-blue-400 hover:underline focus:outline-none">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthComponent
