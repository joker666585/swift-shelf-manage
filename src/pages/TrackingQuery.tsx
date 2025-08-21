import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Truck, Clock, MapPin, CheckCircle, Package } from 'lucide-react';
import { useState } from 'react';

const carrierLogos = {
  DHL: '🇩🇪',
  UPS: '🇺🇸', 
  FedEx: '🇺🇸',
  USPS: '🇺🇸',
  EMS: '🇨🇳'
};

const mockTrackingData = {
  'DHL123456789': {
    carrier: 'DHL',
    status: 'in_transit',
    statusText: '运输中',
    origin: '深圳, 中国',
    destination: '纽约, 美国',
    estimatedDelivery: '2024-01-25',
    timeline: [
      { date: '2024-01-20 14:30', location: '深圳', event: '包裹已发出', status: 'completed' },
      { date: '2024-01-21 08:15', location: '香港转运中心', event: '到达转运中心', status: 'completed' },
      { date: '2024-01-22 16:45', location: '飞行中', event: '已发往目的地', status: 'current' },
      { date: '2024-01-25 (预计)', location: '纽约', event: '预计送达', status: 'pending' }
    ]
  },
  'UPS987654321': {
    carrier: 'UPS',
    status: 'delivered',
    statusText: '已送达',
    origin: '洛杉矶, 美国',
    destination: '上海, 中国',
    estimatedDelivery: '2024-01-22',
    timeline: [
      { date: '2024-01-18 10:00', location: '洛杉矶', event: '包裹已发出', status: 'completed' },
      { date: '2024-01-20 14:30', location: '安克雷奇', event: '转运中心处理', status: 'completed' },
      { date: '2024-01-21 11:20', location: '上海浦东机场', event: '到达目的地', status: 'completed' },
      { date: '2024-01-22 15:45', location: '上海', event: '已成功送达', status: 'completed' }
    ]
  }
};

export default function TrackingQuery() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsSearching(true);
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = mockTrackingData[trackingNumber] || null;
    setTrackingResult(result);
    setIsSearching(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'current': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Layout title="物流查询">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>物流轨迹查询</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">快递公司</label>
                <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择快递公司" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DHL">DHL {carrierLogos.DHL}</SelectItem>
                    <SelectItem value="UPS">UPS {carrierLogos.UPS}</SelectItem>
                    <SelectItem value="FedEx">FedEx {carrierLogos.FedEx}</SelectItem>
                    <SelectItem value="USPS">USPS {carrierLogos.USPS}</SelectItem>
                    <SelectItem value="EMS">EMS {carrierLogos.EMS}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">快递单号</label>
                <Input
                  placeholder="请输入快递单号"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                  {isSearching ? '查询中...' : '查询'}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              测试单号: DHL123456789, UPS987654321
            </div>
          </CardContent>
        </Card>

        {trackingResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{carrierLogos[trackingResult.carrier]} {trackingResult.carrier}</span>
                  <Badge variant={trackingResult.status === 'delivered' ? 'default' : 'secondary'}>
                    {trackingResult.statusText}
                  </Badge>
                </div>
                <span className="text-sm font-normal text-muted-foreground">
                  单号: {trackingNumber}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">发货地</div>
                    <div className="font-medium">{trackingResult.origin}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">目的地</div>
                    <div className="font-medium">{trackingResult.destination}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">预计送达</div>
                    <div className="font-medium">{trackingResult.estimatedDelivery}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">物流轨迹</h4>
                <div className="space-y-3">
                  {trackingResult.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{event.event}</div>
                            <div className="text-sm text-muted-foreground">{event.location}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">{event.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trackingResult === null && trackingNumber && !isSearching && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">未找到该单号的物流信息，请检查单号是否正确</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}