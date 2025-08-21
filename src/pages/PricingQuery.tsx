import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, Plus, Edit, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPriceChannels, savePriceChannels, PriceChannel } from '@/lib/storage';

const countries = [
  '美国', '加拿大', '英国', '德国', '法国', '意大利', '澳大利亚', '日本', '韩国', '新加坡'
];

export default function PricingQuery() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [weight, setWeight] = useState('');
  const [priceChannels, setPriceChannels] = useState<PriceChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<PriceChannel[]>([]);
  const [calculationResults, setCalculationResults] = useState<any[]>([]);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PriceChannel | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<PriceChannel>>({
    channel: '',
    country: '',
    weightRange: '',
    billingMethod: '',
    firstWeight: 0,
    additionalWeight: 0,
    unit: '',
    timeFrame: '',
    notes: ''
  });

  useEffect(() => {
    const channels = getPriceChannels();
    setPriceChannels(channels);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const filtered = priceChannels.filter(channel => 
        channel.country === selectedCountry
      );
      setFilteredChannels(filtered);
    } else {
      setFilteredChannels([]);
    }
  }, [selectedCountry, priceChannels]);

  const calculateShipping = () => {
    if (!weight || !selectedCountry) return;

    const weightNum = parseFloat(weight);
    const results = filteredChannels.map(channel => {
      let finalPrice = 0;
      let billingWeight = weightNum;

      // 解析重量范围
      const [minWeight, maxWeight] = channel.weightRange.split('-').map(w => parseFloat(w.replace('kg', '')));
      
      if (weightNum < minWeight || weightNum > maxWeight) {
        return {
          ...channel,
          billingWeight: 0,
          finalPrice: '不适用',
          applicable: false
        };
      }

      // 计算运费
      if (channel.billingMethod.includes('首重+续重')) {
        const unit = parseFloat(channel.unit.replace('kg', ''));
        if (weightNum <= unit) {
          finalPrice = channel.firstWeight;
        } else {
          const additionalUnits = Math.ceil((weightNum - unit) / unit);
          finalPrice = channel.firstWeight + (additionalUnits * channel.additionalWeight);
        }
      } else if (channel.billingMethod.includes('重量计费+操作费')) {
        finalPrice = (weightNum * channel.firstWeight) + channel.additionalWeight;
      } else {
        // 简单重量计费
        finalPrice = weightNum * channel.firstWeight;
      }

      return {
        ...channel,
        billingWeight: weightNum,
        finalPrice: `¥${finalPrice.toFixed(2)}`,
        applicable: true
      };
    });

    setCalculationResults(results);
  };

  const handleAddChannel = () => {
    if (newChannel.channel && newChannel.country) {
      const channel: PriceChannel = {
        channel: newChannel.channel || '',
        country: newChannel.country || '',
        weightRange: newChannel.weightRange || '',
        billingMethod: newChannel.billingMethod || '',
        firstWeight: newChannel.firstWeight || 0,
        additionalWeight: newChannel.additionalWeight || 0,
        unit: newChannel.unit || '',
        timeFrame: newChannel.timeFrame || '',
        notes: newChannel.notes || ''
      };

      const updatedChannels = [...priceChannels, channel];
      setPriceChannels(updatedChannels);
      savePriceChannels(updatedChannels);
      
      setNewChannel({
        channel: '',
        country: '',
        weightRange: '',
        billingMethod: '',
        firstWeight: 0,
        additionalWeight: 0,
        unit: '',
        timeFrame: '',
        notes: ''
      });
      setIsAddChannelOpen(false);
    }
  };

  const handleEditChannel = (channel: PriceChannel) => {
    setEditingChannel(channel);
    setNewChannel(channel);
    setIsAddChannelOpen(true);
  };

  const handleUpdateChannel = () => {
    if (editingChannel && newChannel.channel && newChannel.country) {
      const updatedChannels = priceChannels.map(channel =>
        channel === editingChannel ? { ...newChannel } as PriceChannel : channel
      );
      setPriceChannels(updatedChannels);
      savePriceChannels(updatedChannels);
      
      setEditingChannel(null);
      setNewChannel({
        channel: '',
        country: '',
        weightRange: '',
        billingMethod: '',
        firstWeight: 0,
        additionalWeight: 0,
        unit: '',
        timeFrame: '',
        notes: ''
      });
      setIsAddChannelOpen(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['渠道', '国家', '重量区间', '计费方式', '首重价格', '续重单价', '计费单位', '时效', '备注'];
    const csvContent = [
      headers.join(','),
      ...priceChannels.map(channel => [
        channel.channel,
        channel.country,
        channel.weightRange,
        channel.billingMethod,
        channel.firstWeight,
        channel.additionalWeight,
        channel.unit,
        channel.timeFrame,
        channel.notes
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '运费报价渠道.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="报价查询">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>运费报价查询</span>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加渠道
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingChannel ? '编辑渠道' : '添加渠道'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">渠道名称</label>
                        <Input
                          value={newChannel.channel}
                          onChange={(e) => setNewChannel({ ...newChannel, channel: e.target.value })}
                          placeholder="如：美国DHL空运"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">国家</label>
                        <Select value={newChannel.country} onValueChange={(value) => setNewChannel({ ...newChannel, country: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择国家" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">重量区间</label>
                        <Input
                          value={newChannel.weightRange}
                          onChange={(e) => setNewChannel({ ...newChannel, weightRange: e.target.value })}
                          placeholder="如：0.5-20kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">计费方式</label>
                        <Input
                          value={newChannel.billingMethod}
                          onChange={(e) => setNewChannel({ ...newChannel, billingMethod: e.target.value })}
                          placeholder="如：首重+续重"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">首重价格</label>
                        <Input
                          type="number"
                          value={newChannel.firstWeight}
                          onChange={(e) => setNewChannel({ ...newChannel, firstWeight: parseFloat(e.target.value) || 0 })}
                          placeholder="元"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">续重单价</label>
                        <Input
                          type="number"
                          value={newChannel.additionalWeight}
                          onChange={(e) => setNewChannel({ ...newChannel, additionalWeight: parseFloat(e.target.value) || 0 })}
                          placeholder="元"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">计费单位</label>
                        <Input
                          value={newChannel.unit}
                          onChange={(e) => setNewChannel({ ...newChannel, unit: e.target.value })}
                          placeholder="如：0.5kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">时效</label>
                        <Input
                          value={newChannel.timeFrame}
                          onChange={(e) => setNewChannel({ ...newChannel, timeFrame: e.target.value })}
                          placeholder="如：3-5工作日"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">备注</label>
                        <Input
                          value={newChannel.notes}
                          onChange={(e) => setNewChannel({ ...newChannel, notes: e.target.value })}
                          placeholder="如：21-51kg每kg65元"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setIsAddChannelOpen(false)}>取消</Button>
                      <Button onClick={editingChannel ? handleUpdateChannel : handleAddChannel}>
                        {editingChannel ? '更新' : '添加'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  导出CSV
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">目的国家</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择目的国家" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">重量 (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="请输入重量"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={calculateShipping} disabled={!selectedCountry || !weight} className="w-full">
                  查询报价
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {calculationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>报价结果</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>渠道</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>重量区间</TableHead>
                    <TableHead>计费方式</TableHead>
                    <TableHead>首重价格</TableHead>
                    <TableHead>续重单价</TableHead>
                    <TableHead>计费单位</TableHead>
                    <TableHead>计费重</TableHead>
                    <TableHead>最终运费</TableHead>
                    <TableHead>时效</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculationResults.map((result, index) => (
                    <TableRow key={index} className={!result.applicable ? 'text-gray-400' : ''}>
                      <TableCell className="font-medium">{result.channel}</TableCell>
                      <TableCell>{result.country}</TableCell>
                      <TableCell>{result.weightRange}</TableCell>
                      <TableCell>{result.billingMethod}</TableCell>
                      <TableCell>¥{result.firstWeight}</TableCell>
                      <TableCell>¥{result.additionalWeight}</TableCell>
                      <TableCell>{result.unit}</TableCell>
                      <TableCell>{result.billingWeight}kg</TableCell>
                      <TableCell className="font-medium text-green-600">{result.finalPrice}</TableCell>
                      <TableCell>{result.timeFrame}</TableCell>
                      <TableCell>{result.notes}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChannel(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>所有渠道管理</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>渠道</TableHead>
                  <TableHead>国家</TableHead>
                  <TableHead>重量区间</TableHead>
                  <TableHead>计费方式</TableHead>
                  <TableHead>首重价格</TableHead>
                  <TableHead>续重单价</TableHead>
                  <TableHead>时效</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceChannels.map((channel, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{channel.channel}</TableCell>
                    <TableCell>{channel.country}</TableCell>
                    <TableCell>{channel.weightRange}</TableCell>
                    <TableCell>{channel.billingMethod}</TableCell>
                    <TableCell>¥{channel.firstWeight}</TableCell>
                    <TableCell>¥{channel.additionalWeight}</TableCell>
                    <TableCell>{channel.timeFrame}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditChannel(channel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}