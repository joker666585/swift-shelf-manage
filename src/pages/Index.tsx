import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  Truck, 
  Search, 
  Calculator,
  BarChart3,
  Archive,
  Settings,
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getPackages, getShipments } from '@/lib/storage';

const Index = () => {
  const [stats, setStats] = useState({
    totalPackages: 0,
    inStock: 0,
    outForDelivery: 0,
    delivered: 0,
    totalShipments: 0,
    pendingShipments: 0
  });

  useEffect(() => {
    const packages = getPackages();
    const shipments = getShipments();
    
    setStats({
      totalPackages: packages.length,
      inStock: packages.filter(p => p.status === 'in_stock').length,
      outForDelivery: packages.filter(p => p.status === 'out_for_delivery').length,
      delivered: packages.filter(p => p.status === 'delivered').length,
      totalShipments: shipments.length,
      pendingShipments: shipments.filter(s => s.status === 'pending').length
    });
  }, []);

  const quickActions = [
    {
      title: '快递录入',
      description: '录入新的快递信息',
      icon: Package,
      path: '/entry',
      color: 'bg-primary text-primary-foreground'
    },
    {
      title: '快递列表',
      description: '查看所有快递信息',
      icon: FileText,
      path: '/packages',
      color: 'bg-secondary text-secondary-foreground'
    },
    {
      title: '发货记录',
      description: '管理发货和收件信息',
      icon: Truck,
      path: '/shipments',
      color: 'bg-accent text-accent-foreground'
    },
    {
      title: '物流查询',
      description: '查询快递物流轨迹',
      icon: Search,
      path: '/tracking',
      color: 'bg-muted text-muted-foreground'
    },
    {
      title: '报价查询',
      description: '查询运费价格',
      icon: Calculator,
      path: '/pricing',
      color: 'bg-primary text-primary-foreground'
    },
    {
      title: '数据统计',
      description: '查看运营数据分析',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-secondary text-secondary-foreground'
    },
    {
      title: '货架管理',
      description: '管理仓储货架信息',
      icon: Archive,
      path: '/shelves',
      color: 'bg-accent text-accent-foreground'
    },
    {
      title: '系统设置',
      description: '配置系统参数',
      icon: Settings,
      path: '/settings',
      color: 'bg-muted text-muted-foreground'
    }
  ];

  return (
    <Layout title="仪表板">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总快递数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">
                在库: {stats.inStock} | 出库: {stats.outForDelivery}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">发货记录</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShipments}</div>
              <p className="text-xs text-muted-foreground">
                待处理: {stats.pendingShipments}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存状态</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.inStock}</div>
              <p className="text-xs text-muted-foreground">
                在库快递数量
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.pendingShipments}</div>
              <p className="text-xs text-muted-foreground">
                待发货记录
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>快速操作</span>
            </CardTitle>
            <CardDescription>
              点击下方按钮快速访问系统各个功能模块
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.path} to={action.path}>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2 w-full hover:shadow-md transition-shadow"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;