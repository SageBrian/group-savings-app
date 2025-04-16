
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, UserCircle, LogOut, BarChart4, PiggyBank, Users, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user had a preference saved in localStorage
    const savedMode = localStorage.getItem('darkMode');
    // Check if system prefers dark mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedMode ? savedMode === 'true' : systemPrefersDark;
  });

  useEffect(() => {
    // Apply dark mode class to html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart4 },
    { path: '/groups', label: 'My Groups', icon: Users },
    { path: '/discover', label: 'Discover', icon: PiggyBank },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 hover-lift">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center apple-gradient-blue text-white">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">SavingCircle</span>
            </Link>
            <div className="flex space-x-4 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode} 
                className="rounded-full"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')} className="rounded-full hover-lift">
                Login
              </Button>
              <Button onClick={() => navigate('/register')} className="rounded-full apple-gradient-blue hover-lift">
                Sign Up
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center apple-gradient-blue text-white">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">SavingCircle</span>
          </Link>
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'apple-gradient-blue text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <Separator orientation="vertical" className="h-8 hidden md:block" />
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDarkMode} 
                  className="rounded-full"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <Avatar className="border-2 border-white dark:border-gray-800 shadow-md">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="apple-gradient-purple text-white">
                    {user?.name ? getInitials(user.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-full text-sm font-medium flex flex-col items-center whitespace-nowrap transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'apple-gradient-blue text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center apple-gradient-blue text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">SavingCircle</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} SavingCircle. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
