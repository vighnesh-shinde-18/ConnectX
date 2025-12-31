"use client";

import React from "react";
import { Shimmer } from '../components/ai-elements/shimmer.jsx';
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className=" relative overflow-hidden sm:px-72 py-16 md:py-28 lg:py-28">
            <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px] h-96 w-96" />
            <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">

                <div className="mb-8 inline-flex items-center justify-center">
                    <Shimmer
                        duration={2.5}
                        className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                    >
                        ✨ ConnectX v1.0 is now live
                    </Shimmer>
                </div>

                <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                    Experience seamless <br className="hidden md:block" />
                    communication with{" "}
                    <Shimmer
                        as="span"
                        duration={3}
                        spread={2}
                        className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 px-2"
                    >
                        ConnectX
                    </Shimmer>
                </h1>

                <p className="mb-10 max-w-2xl text-lg text-slate-600 md:text-xl dark:text-slate-400">
                    The ultimate <strong>Realtime Chat App</strong> designed for speed and security.
                    Connect instantly with friends, share files, and enjoy AI-powered conversations without boundaries.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    {/* 👇 FIXED: Wrapped in () => ... */}
                    <button 
                        onClick={() => navigate("/chat-list")} 
                        className="cursor-pointer inline-flex h-12 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Start Chatting Now
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Hero;