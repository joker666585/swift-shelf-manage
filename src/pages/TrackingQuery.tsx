import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Truck, Clock, MapPin, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { TrackingService, TrackingResult } from '@/lib/tracking';
import { useToast } from '@/hooks/use-toast';

const carrierLogos = {
  DHL: '🇩🇪',
  UPS: '🇺🇸', 
  FedEx: '🇺🇸',
  USPS: '🇺🇸',
  EMS: '🇨🇳'
};


export default function TrackingQuery() {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "请输入快递单号",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      const result = await TrackingService.getTrackingInfo(trackingNumber, selectedCarrier);
      setTrackingResult(result);
      
      if (!result) {
        toast({
          title: "未找到物流信息",
          description: "请检查快递单号是否正确，或稍后再试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('查询失败:', error);
      toast({
        title: "查询失败",
        description: "网络错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
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
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>支持实时物流查询，测试单号: DHL123456789, UPS987654321</span>
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

        {trackingResult === null && searchPerformed && !isSearching && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">未找到该单号的物流信息，请检查单号是否正确</p>
              <p className="text-sm text-muted-foreground mt-2">
                如果单号正确，可能是物流公司尚未更新信息，请稍后再试
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}