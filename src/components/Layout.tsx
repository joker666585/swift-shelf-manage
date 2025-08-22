import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  Truck, 
  Search, 
  Calculator,
  BarChart3,
  Archive,
  Settings,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '快递录入', path: '/entry', icon: Package },
  { name: '快递列表', path: '/packages', icon: FileText },
  { name: '发货记录', path: '/shipments', icon: Truck },
  { name: '物流查询', path: '/tracking', icon: Search },
  { name: '报价查询', path: '/pricing', icon: Calculator },
  { name: '数据统计', path: '/analytics', icon: BarChart3 },
  { name: '货架管理', path: '/shelves', icon: Archive },
  { name: '系统设置', path: '/settings', icon: Settings },
];

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8" />
              <h1 className="text-xl font-bold">深圳迅翊国际快递仓库管理系统</h1>
            </div>
            {title && (
              <h2 className="text-lg font-medium">{title}</h2>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}