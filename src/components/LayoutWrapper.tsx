'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  AlertTriangle, 
  UploadCloud, 
  Info, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { name: 'Upload & Simulate', path: '/upload', icon: UploadCloud },
    { name: 'System Info & About', path: '/about', icon: Info },
  ];

  // Landing Page Layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 selection:bg-red-500 selection:text-white">
        {/* Landing Top Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f172a]/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                Smart<span className="text-red-500">Guard</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200"
              >
                Launch Dashboard
              </Link>
            </nav>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#0f172a]/95 backdrop-blur-md pt-20 px-6 border-b border-slate-800 flex flex-col gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-red-400 transition-colors py-2 border-b border-slate-800"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="mt-4 text-center px-4 py-3 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-all"
            >
              Launch Dashboard
            </Link>
          </div>
        )}

        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-[#0b0f19] border-t border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <span className="font-bold text-lg text-white">SmartGuard</span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} SmartGuard System. AI-Powered Accident Detection & Response. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Portal</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard / Internal App Layout
  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 selection:bg-red-500 selection:text-white font-sans">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-[#0f172a] text-slate-100 transition-all duration-300 border-r border-slate-800 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } shrink-0 sticky top-0 h-screen`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight text-white animate-fade-in whitespace-nowrap">
                Smart<span className="text-red-500">Guard</span>
              </span>
            )}
          </Link>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group duration-150 ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/15' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400 transition-colors'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info in Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 flex flex-col gap-1">
            <p className="font-medium text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-500" /> System Online
            </p>
            <p>V1.0.0-YOLOv11</p>
          </div>
        )}
      </aside>

      {/* Mobile Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="md:hidden bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="font-bold text-lg tracking-tight">
              Smart<span className="text-red-500">Guard</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer for Internal Pages */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#0f172a]/95 backdrop-blur-md pt-20 px-6 border-b border-slate-800 flex flex-col gap-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded bg-slate-800 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 text-lg font-medium p-3 rounded-lg border-b border-slate-800/50 ${
                    isActive ? 'text-red-400 bg-slate-800/30' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
