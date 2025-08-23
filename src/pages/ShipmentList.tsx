import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, Plus, Eye, Printer, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import CreateShipmentDialog from '@/components/CreateShipmentDialog';
import { getShipments, Shipment } from '@/lib/storage';

export default function ShipmentList() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = () => {
    const data = getShipments();
    setShipments(data);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待发货';
      case 'shipped': return '已发货';
      case 'delivered': return '已送达';
      default: return status;
    }
  };

  const handlePrint = (shipment: Shipment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>发货单 - ${shipment.trackingNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>深圳迅翊国际快递仓库管理系统</h1>
              <h2>发货单</h2>
              <p>发货单号: ${shipment.trackingNumber}</p>
              <p>发货日期: ${new Date(shipment.shipmentDate).toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h3>收件人信息</h3>
              <p><strong>姓名:</strong> ${shipment.recipient.name}</p>
              <p><strong>电话:</strong> ${shipment.recipient.phone}</p>
              <p><strong>邮箱:</strong> ${shipment.recipient.email}</p>
              <p><strong>地址:</strong> ${shipment.recipient.address}</p>
              <p><strong>国家:</strong> ${shipment.recipient.country}</p>
              <p><strong>邮编:</strong> ${shipment.recipient.zipCode}</p>
            </div>
            
            <div class="section">
              <h3>包裹清单</h3>
              <table>
                <thead>
                  <tr>
                    <th>快递单号</th>
                    <th>归属人</th>
                    <th>货架位置</th>
                    <th>重量</th>
                    <th>标签</th>
                  </tr>
                </thead>
                <tbody>
                  ${shipment.packages.map(pkg => `
                    <tr>
                      <td>${pkg.trackingNumber}</td>
                      <td>${pkg.owner}</td>
                      <td>${pkg.shelf}</td>
                      <td>${pkg.weight ? pkg.weight + 'kg' : '-'}</td>
                      <td>${pkg.tags.join(', ')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <p><strong>总包裹数:</strong> ${shipment.packages.length} 件</p>
              <p><strong>总重量:</strong> ${shipment.packages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0).toFixed(1)} kg</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = (shipment: Shipment) => {
    const csvData = [
      ['发货单号', shipment.trackingNumber],
      ['发货日期', new Date(shipment.shipmentDate).toLocaleDateString()],
      ['收件人姓名', shipment.recipient.name],
      ['收件人电话', shipment.recipient.phone],
      ['收件人邮箱', shipment.recipient.email],
      ['收件人地址', shipment.recipient.address],
      ['收件人国家', shipment.recipient.country],
      ['收件人邮编', shipment.recipient.zipCode],
      [''],
      ['快递单号', '归属人', '货架位置', '重量', '标签'],
      ...shipment.packages.map(pkg => [
        pkg.trackingNumber,
        pkg.owner,
        pkg.shelf,
        pkg.weight ? `${pkg.weight}kg` : '-',
        pkg.tags.join('; ')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `发货单_${shipment.trackingNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="发货记录">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>发货管理</span>
              </CardTitle>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建发货
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Shipment List */}
        <div className="grid gap-4">
          {shipments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">暂无发货记录</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateDialog(true)}
                >
                  创建第一个发货记录
                </Button>
              </CardContent>
            </Card>
          ) : (
            shipments.map((shipment) => (
              <Card key={shipment.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">发货单号: {shipment.trackingNumber}</h3>
                        <Badge variant={getStatusBadgeVariant(shipment.status)}>
                          {getStatusLabel(shipment.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        发货日期: {new Date(shipment.shipmentDate).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingShipment(shipment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(shipment)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        打印
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(shipment)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        导出
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">收件人信息</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">姓名:</span> {shipment.recipient.name}</p>
                        <p><span className="font-medium">电话:</span> {shipment.recipient.phone}</p>
                        <p><span className="font-medium">邮箱:</span> {shipment.recipient.email}</p>
                        <p><span className="font-medium">地址:</span> {shipment.recipient.address}</p>
                        <p><span className="font-medium">国家:</span> {shipment.recipient.country}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        包含快递 ({shipment.packages.length}件)
                      </h4>
                      <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                        {shipment.packages.map((pkg) => (
                          <div key={pkg.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="font-mono">{pkg.trackingNumber}</span>
                            <span className="text-muted-foreground">{pkg.owner}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Shipment Dialog */}
        <CreateShipmentDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            loadShipments();
            setShowCreateDialog(false);
            toast({
              title: "成功",
              description: "发货记录已创建",
            });
          }}
        />

        {/* View Shipment Detail Dialog */}
        {viewingShipment && (
          <Dialog open={true} onOpenChange={() => setViewingShipment(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>发货详情 - {viewingShipment.trackingNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">收件人信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><span className="font-medium">姓名:</span> {viewingShipment.recipient.name}</div>
                      <div><span className="font-medium">电话:</span> {viewingShipment.recipient.phone}</div>
                      <div><span className="font-medium">邮箱:</span> {viewingShipment.recipient.email}</div>
                      <div><span className="font-medium">地址:</span> {viewingShipment.recipient.address}</div>
                      <div><span className="font-medium">国家:</span> {viewingShipment.recipient.country}</div>
                      <div><span className="font-medium">邮编:</span> {viewingShipment.recipient.zipCode}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">发货信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><span className="font-medium">状态:</span> 
                        <Badge variant={getStatusBadgeVariant(viewingShipment.status)} className="ml-2">
                          {getStatusLabel(viewingShipment.status)}
                        </Badge>
                      </div>
                      <div><span className="font-medium">发货日期:</span> {new Date(viewingShipment.shipmentDate).toLocaleString()}</div>
                      <div><span className="font-medium">包裹数量:</span> {viewingShipment.packages.length} 件</div>
                      <div><span className="font-medium">总重量:</span> {viewingShipment.packages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0).toFixed(1)} kg</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      包含的快递
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">快递单号</th>
                            <th className="text-left p-2">归属人</th>
                            <th className="text-left p-2">货架位置</th>
                            <th className="text-left p-2">重量</th>
                            <th className="text-left p-2">标签</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingShipment.packages.map((pkg) => (
                            <tr key={pkg.id} className="border-b">
                              <td className="p-2 font-mono">{pkg.trackingNumber}</td>
                              <td className="p-2">{pkg.owner}</td>
                              <td className="p-2">{pkg.shelf}</td>
                              <td className="p-2">{pkg.weight ? `${pkg.weight}kg` : '-'}</td>
                              <td className="p-2">
                                <div className="flex flex-wrap gap-1">
                                  {pkg.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}