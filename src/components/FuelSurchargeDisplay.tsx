import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FuelSurcharge {
  carrier: string;
  rate: number;
  lastUpdated: string;
}

export default function FuelSurchargeDisplay() {
  const { toast } = useToast();
  const [fuelSurcharges, setFuelSurcharges] = useState<FuelSurcharge[]>([
    { carrier: 'DHL', rate: 24.5, lastUpdated: '2024-01-15' },
    { carrier: 'UPS', rate: 18.25, lastUpdated: '2024-01-15' },
    { carrier: 'FedEx', rate: 19.75, lastUpdated: '2024-01-15' }
  ]);
  const [editingCarrier, setEditingCarrier] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<string>('');

  const handleEditRate = (carrier: string, currentRate: number) => {
    setEditingCarrier(carrier);
    setNewRate(currentRate.toString());
  };

  const handleSaveRate = () => {
    if (!editingCarrier || !newRate) return;
    
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0) {
      toast({
        title: "输入错误",
        description: "请输入有效的燃油附加费率",
        variant: "destructive",
      });
      return;
    }

    setFuelSurcharges(prev => 
      prev.map(item => 
        item.carrier === editingCarrier 
          ? { ...item, rate, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      )
    );

    toast({
      title: "更新成功",
      description: `${editingCarrier} 燃油附加费已更新为 ${rate}%`,
    });

    setEditingCarrier(null);
    setNewRate('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fuel className="h-5 w-5" />
          <span>当月燃油附加费</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fuelSurcharges.map((item) => (
            <div key={item.carrier} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{item.carrier}</div>
                <div className="text-2xl font-bold text-primary">{item.rate}%</div>
                <div className="text-xs text-muted-foreground">
                  更新于: {item.lastUpdated}
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRate(item.carrier, item.rate)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>修改 {item.carrier} 燃油附加费</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rate">燃油附加费率 (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        placeholder="请输入新的费率"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setEditingCarrier(null)}>
                        取消
                      </Button>
                      <Button onClick={handleSaveRate}>
                        保存
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          * 燃油附加费每月更新，具体费率以快递公司官方公布为准
        </div>
      </CardContent>
    </Card>
  );
}