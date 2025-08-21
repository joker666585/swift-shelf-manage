import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Package, Truck, Users, Archive, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPackages, getShipments, getShelves, getOwners } from '@/lib/storage';

export default function Analytics() {
  const [packages, setPackages] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({
    totalPackages: 0,
    inStockPackages: 0,
    deliveredPackages: 0,
    totalShipments: 0,
    shelfUtilization: 0,
    totalOwners: 0
  });

  useEffect(() => {
    const packagesData = getPackages();
    const shipmentsData = getShipments();
    const shelvesData = getShelves();
    const ownersData = getOwners();

    setPackages(packagesData);
    setShipments(shipmentsData);
    setShelves(shelvesData);
    setOwners(ownersData);

    // 计算统计数据
    const inStock = packagesData.filter(p => p.status === 'in_stock').length;
    const delivered = packagesData.filter(p => p.status === 'delivered').length;
    const totalCapacity = shelvesData.reduce((sum, shelf) => sum + shelf.capacity, 0);
    const totalOccupied = shelvesData.reduce((sum, shelf) => sum + shelf.currentCount, 0);
    
    setStats({
      totalPackages: packagesData.length,
      inStockPackages: inStock,
      deliveredPackages: delivered,
      totalShipments: shipmentsData.length,
      shelfUtilization: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0,
      totalOwners: ownersData.length
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'signed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'in_stock': '入库',
      'out_for_delivery': '出库',
      'delivered': '已出库',
      'pending': '待出库',
      'signed': '已签收',
      'deleted': '已删除'
    };
    return statusMap[status] || status;
  };

  const statusDistribution = packages.reduce((acc, pkg) => {
    acc[pkg.status] = (acc[pkg.status] || 0) + 1;
    return acc;
  }, {});

  const shelfDistribution = packages.reduce((acc, pkg) => {
    acc[pkg.shelf] = (acc[pkg.shelf] || 0) + 1;
    return acc;
  }, {});

  const ownerDistribution = packages.reduce((acc, pkg) => {
    acc[pkg.owner] = (acc[pkg.owner] || 0) + 1;
    return acc;
  }, {});

  // 最近7天的数据（模拟）
  const dailyStats = [
    { date: '01-15', packages: 12, shipments: 3 },
    { date: '01-16', packages: 8, shipments: 5 },
    { date: '01-17', packages: 15, shipments: 2 },
    { date: '01-18', packages: 10, shipments: 4 },
    { date: '01-19', packages: 18, shipments: 6 },
    { date: '01-20', packages: 14, shipments: 3 },
    { date: '01-21', packages: 20, shipments: 7 }
  ];

  return (
    <Layout title="数据统计">
      <div className="space-y-6">
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">总包裹数</p>
                  <p className="text-2xl font-bold">{stats.totalPackages}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+12%</span>
                <span className="text-muted-foreground ml-1">较上月</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">在库包裹</p>
                  <p className="text-2xl font-bold">{stats.inStockPackages}</p>
                </div>
                <Archive className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-red-600">-5%</span>
                <span className="text-muted-foreground ml-1">较上周</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">发货次数</p>
                  <p className="text-2xl font-bold">{stats.totalShipments}</p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+8%</span>
                <span className="text-muted-foreground ml-1">较上月</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">货架利用率</p>
                  <p className="text-2xl font-bold">{stats.shelfUtilization.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <Progress value={stats.shelfUtilization} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* 状态分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>包裹状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count as number}个</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${((count as number) / stats.totalPackages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>货架分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(shelfDistribution).slice(0, 10).map(([shelf, count]) => (
                  <div key={shelf} className="flex items-center justify-between">
                    <span className="font-medium">{shelf}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count as number}个</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${((count as number) / stats.totalPackages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 归属人分布和货架详情 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>归属人分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(ownerDistribution).slice(0, 10).map(([owner, count]) => (
                  <div key={owner} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{owner}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count as number}个</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${((count as number) / stats.totalPackages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>货架使用情况</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shelves.map((shelf) => (
                  <div key={shelf.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{shelf.name} - {shelf.location}</span>
                      <span className="text-sm text-muted-foreground">
                        {shelf.currentCount}/{shelf.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={(shelf.currentCount / shelf.capacity) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 趋势图表 */}
        <Card>
          <CardHeader>
            <CardTitle>最近7天数据趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-sm text-center">
                {dailyStats.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-muted-foreground">{day.date}</div>
                    <div className="space-y-1">
                      <div 
                        className="bg-blue-600 rounded"
                        style={{ height: `${(day.packages / 20) * 60}px`, minHeight: '4px' }}
                      />
                      <div className="text-xs">{day.packages}入</div>
                    </div>
                    <div className="space-y-1">
                      <div 
                        className="bg-green-600 rounded"
                        style={{ height: `${(day.shipments / 10) * 40}px`, minHeight: '4px' }}
                      />
                      <div className="text-xs">{day.shipments}出</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>入库包裹</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>发货次数</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}