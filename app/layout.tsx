'use client'
import { useState, useEffect } from "react";
import "./globals.css"
import {Inter} from 'next/font/google';

import {Toaster} from 'react-hot-toast';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getAvailableRewards, getUserByEmail } from "@/utils/db/actions";
import { appMetadata } from "./metadata";


const inter = Inter({
  subsets: ['latin'],

})

export default function RootLayout ({
  children
}:Readonly<
  {children: React.ReactNode}>) 
{
  const [sidebarOpen, setsidebarOpen] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if(userEmail){
        const user = await getUserByEmail(userEmail);
        if(user){
          const availableRewards = await getAvailableRewards(user.id) as any;
          setTotalEarnings(availableRewards);
        }
      }
    } catch (error) {
       console.error("Error fetching total earnings", error);
    }
    }
    fetchTotalEarnings();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>{String(appMetadata.title) ?? 'Default Title'}</title>
        <meta name="description" content={appMetadata.description ?? 'Default description'} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header onMenuClick={() => setsidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings}/>
              <div className="flex flex-1">
                    <Sidebar open={sidebarOpen}/>
                    <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
                        {children}
                    </main>
              </div> 
        </div>
        <Toaster/>
      </body>
    </html>
  );
}
