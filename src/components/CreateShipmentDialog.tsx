
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, User, X, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPackages, addShipment, updatePackage, generateId, Package as PackageType } from '@/lib/storage';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateShipmentDialog({ open, onOpenChange, onSuccess }: CreateShipmentDialogProps) {
  const { toast } = useToast();
  const [availablePackages, setAvailablePackages] = useState<PackageType[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [filterByOwner, setFilterByOwner] = useState<string>('all');
  const [owners, setOwners] = useState<string[]>([]);
  const [recipientInfo, setRecipientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    country: '',
    zipCode: ''
  });

  useEffect(() => {
    if (open) {
      // Load packages that are available for shipment (in_stock or pending)
      const packages = getPackages().filter(pkg => 
        pkg.status === 'in_stock' || pkg.status === 'pending'
      );
      setAvailablePackages(packages);
      
      // Get unique owners
      const uniqueOwners = [...new Set(packages.map(pkg => pkg.owner))];
      setOwners(uniqueOwners);
    }
  }, [open]);

  const handleSelectPackage = (packageId: string, checked: boolean) => {
    const newSelected = new Set(selectedPackages);
    if (checked) {
      newSelected.add(packageId);
    } else {
      newSelected.delete(packageId);
    }
    setSelectedPackages(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const currentFilteredPackages = filterByOwner === 'all'
      ? availablePackages
      : availablePackages.filter(pkg => pkg.owner === filterByOwner);
    
    if (checked) {
      setSelectedPackages(new Set(currentFilteredPackages.map(pkg => pkg.id)));
    } else {
      setSelectedPackages(new Set());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPackages.size === 0) {
      toast({
        title: "错误",
        description: "请选择至少一个快递包裹",
        variant: "destructive",
      });
      return;
    }

    if (!recipientInfo.name || !recipientInfo.phone || !recipientInfo.address || !recipientInfo.country) {
      toast({
        title: "错误",
        description: "请填写完整的收件人信息",
        variant: "destructive",
      });
      return;
    }

    const selectedPackageData = availablePackages.filter(pkg => selectedPackages.has(pkg.id));
    
    const shipment = {
      id: generateId(),
      packages: selectedPackageData,
      recipient: recipientInfo,
      shipmentDate: new Date().toISOString(),
      status: 'pending' as const,
      trackingNumber: `SH${Date.now().toString().slice(-8)}`
    };

    // Add shipment
    addShipment(shipment);

    // Update package statuses to 'out_for_delivery'
    selectedPackageData.forEach(pkg => {
      updatePackage(pkg.id, { status: 'out_for_delivery' });
    });

    // Reset form
    setSelectedPackages(new Set());
    setRecipientInfo({
      name: '',
      phone: '',
      email: '',
      address: '',
      country: '',
      zipCode: ''
    });

    onSuccess();
  };

  // Filter packages by owner if selected
  const filteredPackages = filterByOwner === 'all'
    ? availablePackages
    : availablePackages.filter(pkg => pkg.owner === filterByOwner);
    
  const selectedPackageData = filteredPackages.filter(pkg => selectedPackages.has(pkg.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>创建发货记录</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>选择快递包裹</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filteredPackages.length > 0 && filteredPackages.every(pkg => selectedPackages.has(pkg.id))}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">全选</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Owner Filter */}
                <div className="mb-4 flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">按归属人筛选:</span>
                  <Select value={filterByOwner} onValueChange={setFilterByOwner}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="全部归属人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部归属人</SelectItem>
                      {owners.map(owner => (
                        <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filteredPackages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {filterByOwner !== 'all' ? `归属人"${filterByOwner}"没有可发货的快递包裹` : '没有可发货的快递包裹'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPackages.has(pkg.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                         onClick={(e) => {
                           const target = e.target as HTMLElement;
                           if (e.target === e.currentTarget || target.tagName === 'DIV' || target.tagName === 'SPAN') {
                             handleSelectPackage(pkg.id, !selectedPackages.has(pkg.id));
                           }
                         }}
                      >
                         <div className="flex items-center space-x-3">
                           <Checkbox
                             checked={selectedPackages.has(pkg.id)}
                             onCheckedChange={(checked) => handleSelectPackage(pkg.id, !!checked)}
                           />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">{pkg.trackingNumber}</span>
                              <Badge variant="outline">{pkg.status === 'in_stock' ? '在库' : '待出库'}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.owner} | {pkg.shelf} | {pkg.weight ? `${pkg.weight}kg` : '未知重量'}
                            </div>
                            {pkg.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pkg.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedPackages.size > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">已选择 {selectedPackages.size} 个包裹</div>
                    <div className="text-sm text-muted-foreground">
                      总重量: {selectedPackageData.reduce((sum, pkg) => sum + (pkg.weight || 0), 0).toFixed(1)} kg
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>收件人信息</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">收件人姓名 *</Label>
                    <Input
                      id="name"
                      value={recipientInfo.name}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入收件人姓名"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">联系电话 *</Label>
                    <Input
                      id="phone"
                      value={recipientInfo.phone}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="输入联系电话"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={recipientInfo.email}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="输入邮箱地址"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">收件地址 *</Label>
                  <Input
                    id="address"
                    value={recipientInfo.address}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="输入详细地址"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">国家/地区 *</Label>
                    <Input
                      id="country"
                      value={recipientInfo.country}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="输入国家或地区"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">邮政编码</Label>
                    <Input
                      id="zipCode"
                      value={recipientInfo.zipCode}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="输入邮政编码"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Packages Summary */}
          {selectedPackages.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>发货清单预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {selectedPackageData.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm">{pkg.trackingNumber}</span>
                        <span className="text-sm">{pkg.owner}</span>
                        <span className="text-sm text-muted-foreground">{pkg.shelf}</span>
                        {pkg.weight && <span className="text-sm text-muted-foreground">{pkg.weight}kg</span>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectPackage(pkg.id, false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              创建发货记录
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
