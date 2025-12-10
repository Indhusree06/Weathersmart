"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="w-full mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-14 max-w-[1400px] mx-auto">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Weather Smart</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    link.href === currentPath ? "text-primary font-semibold bg-primary/10" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {userInitial || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{userName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email || userEmail}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">A</span>
                </div>
                <span className="text-sm text-muted-foreground">{userEmail}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
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
