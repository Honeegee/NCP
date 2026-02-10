"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Users,
  Settings,
  Stethoscope,
  ClipboardCheck,
  Hospital,
  Calendar,
  Activity,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NovuNotificationBell } from "@/components/shared/NotificationBell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LucideIcon } from "lucide-react";
import { Session } from "next-auth";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NURSE_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/profile", label: "Profile", icon: Stethoscope },
  { href: "/jobs", label: "Job Matches", icon: ClipboardCheck },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Overview", icon: Hospital },
  { href: "/admin/nurses", label: "Nurses", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Calendar },
];

function Logo({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 group">
      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-105 transition-transform">
        <Stethoscope className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xl text-white">Nurse Care Pro</span>
        <span className="text-xs text-white/70">Healthcare Platform</span>
      </div>
      {isAdmin && (
        <span className="ml-2 text-xs bg-amber-500/20 text-amber-100 px-3 py-1 rounded-full border border-amber-400/30">
          Admin
        </span>
      )}
    </Link>
  );
}

function NavLinks({ links, pathname }: { links: NavLink[]; pathname: string }) {
  return (
    <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-white/30 text-white shadow-lg border border-white/30"
                : "text-white/90 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function UserMenu({ 
  session, 
  isAdmin,
  userName,
  initials,
  profilePictureUrl,
  userMenuOpen,
  setUserMenuOpen,
  menuRef 
}: {
  session: Session;
  isAdmin: boolean;
  userName: string;
  initials: string;
  profilePictureUrl?: string;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="relative"
      >
        <Avatar className="h-11 w-11 border-2 border-white/40 shadow-lg cursor-pointer hover:border-white/60 transition-all">
          {profilePictureUrl ? (
            <>
              <AvatarImage 
                src={profilePictureUrl} 
                alt={userName}
                className="object-cover"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <AvatarFallback className="bg-white/30 backdrop-blur-lg text-white text-base font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </>
          ) : (
            <AvatarFallback className="bg-white/30 backdrop-blur-lg text-white text-base font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border shadow-xl py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
          
          {/* Menu Items */}
          <>
            <Link
              href="/profile"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              {isAdmin ? "Profile" : "My Profile"}
            </Link>
            <Link
              href="/settings"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full border-t mt-1"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function MobileNav({ 
  links, 
  pathname, 
  isAdmin,
  userName,
  initials,
  profilePictureUrl,
  session,
  userMenuOpen,
  setUserMenuOpen,
  menuRef
}: { 
  links: NavLink[]; 
  pathname: string; 
  isAdmin: boolean;
  userName: string;
  initials: string;
  profilePictureUrl?: string;
  session: Session;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-xl border-t border-white/20 shadow-2xl safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-center p-3 rounded-xl transition-all",
                isActive
                  ? "text-white bg-white/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
        
        {/* User Menu Button */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "flex items-center justify-center p-2 rounded-xl transition-all",
              userMenuOpen 
                ? "text-white bg-white/30" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Avatar className="h-10 w-10 border-2 border-white/40">
              {profilePictureUrl && (
                <AvatarImage 
                  src={profilePictureUrl} 
                  alt={userName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-white/30 text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Mobile Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl border shadow-xl py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
              
              {/* Menu Items */}
              <>
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  {isAdmin ? "Profile" : "My Profile"}
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
              
              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full border-t mt-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch profile picture URL
  useEffect(() => {
    if (session?.user) {
      const fetchProfilePicture = async () => {
        try {
          const res = await fetch("/api/nurses/me");
          if (res.ok) {
            const profile = await res.json();
            setProfilePictureUrl(profile.profile_picture_url);
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      };
      fetchProfilePicture();
    }
  }, [session?.user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClasses = cn(
    "sticky top-0 inset-x-0 z-50 transition-all duration-500",
    scrolled
      ? "bg-primary backdrop-blur-xl border-b border-white/20 shadow-2xl"
      : "bg-primary/95 backdrop-blur-lg border-b border-white/10 shadow-lg"
  );

  if (status === "loading") {
    return (
      <nav className={navClasses}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 animate-pulse" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session) {
    return (
      <nav className={navClasses}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-105 transition-transform">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white">Nurse Care Pro</span>
                <span className="text-xs text-white/70">Healthcare Platform</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl px-3 sm:px-5 py-2">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 rounded-xl px-4 sm:px-6 py-2 shadow-lg hover:scale-105 transition-all font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isAdmin = session.user.role === "admin";
  const emailUsername = session.user.email?.split("@")[0] || "User";
  const derivedFirstName = emailUsername.split(/[._-]/)[0].charAt(0).toUpperCase() + emailUsername.split(/[._-]/)[0].slice(1).toLowerCase();
  const firstName = session.user.firstName || derivedFirstName;
  const lastName = session.user.lastName || "";
  const userName = lastName ? `${firstName} ${lastName}` : firstName;
  const initials = userName.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();
  const links = isAdmin ? ADMIN_LINKS : NURSE_LINKS;

  return (
    <>
      <nav className={navClasses}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo isAdmin={isAdmin} />
            <NavLinks links={links} pathname={pathname} />
            
            <div className="flex items-center gap-3">
              <NovuNotificationBell />
              <div className="hidden md:block">
                <UserMenu 
                  session={session}
                  isAdmin={isAdmin}
                  userName={userName}
                  initials={initials}
                  profilePictureUrl={profilePictureUrl}
                  userMenuOpen={userMenuOpen}
                  setUserMenuOpen={setUserMenuOpen}
                  menuRef={menuRef}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      {session && (
        <MobileNav 
          links={links}
          pathname={pathname}
          isAdmin={isAdmin}
          userName={userName}
          initials={initials}
          profilePictureUrl={profilePictureUrl}
          session={session}
          userMenuOpen={mobileMenuOpen}
          setUserMenuOpen={setMobileMenuOpen}
          menuRef={mobileMenuRef}
        />
      )}
    </>
  );
}