import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PieChart, TrendingUp, FileText, Home } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/transactions', icon: PieChart, label: 'Transações' },
    { to: '/reports', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              H.O.P.E.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.to}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className="transition-all duration-200"
                >
                  <Link to={item.to} className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};