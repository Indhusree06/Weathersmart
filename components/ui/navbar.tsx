"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavLink {
  name: string;
  href: string;
}

interface NavbarProps {
  navLinks: NavLink[];
  currentPath: string;
  onLogout: () => void;
  userEmail?: string;
  user?: any;
  userInitial?: string;
  userName?: string;
}

export function Navbar({ 
  navLinks, 
  currentPath, 
  onLogout, 
  userEmail = "abcd@gmail.com",
  user,
  userInitial,
  userName
}: NavbarProps) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="w-full mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-16 max-w-[1400px] mx-auto">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Weather Smart</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    link.href === currentPath ? "text-white font-semibold bg-gray-700" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {userInitial || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{userName || "User"}</p>
                  <p className="text-xs text-gray-400">{user.email || userEmail}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-sm text-gray-300">{userEmail}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}