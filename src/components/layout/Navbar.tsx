import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Atom,
  FileText,
  User,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Sparkles, badge: 'Flash' },
    { id: 'math', label: 'Mathematics', icon: Calculator },
    { id: 'science', label: 'Science', icon: Atom },
    { id: 'pdfs', label: 'PDF Library', icon: FileText },
    { id: 'about', label: 'About', icon: null },
    { id: 'contact', label: 'Contact', icon: null },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 dark:bg-slate-950/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">Studyhub</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CBSE 10
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-medium tracking-wide">
                Learn Smart. Practice More.
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-80" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Admin Direct Button */}
            {isAdmin ? (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'bg-amber-950/40 text-amber-400 border-amber-800/60 hover:bg-amber-900/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin-login')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-all"
                title="Separate Administrator Login"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Auth State Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-slate-200 truncate">{user.displayName || 'Student'}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          <Shield className="w-3 h-3" /> Admin Mode
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>Student Dashboard</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm shadow-emerald-500/30 transition-all hover:scale-102"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Student Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}

            {isAdmin ? (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin-login')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold text-amber-400/90 bg-amber-500/5 border border-amber-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Administrator Login</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
