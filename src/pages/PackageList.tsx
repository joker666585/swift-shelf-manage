import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Download, Edit, Trash2, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  getPackages, 
  updatePackage, 
  deletePackage,
  getShelves,
  getOwners,
  getTags,
  getStatuses,
  Package
} from '@/lib/storage';

const ITEMS_PER_PAGE = 50;

export default function PackageList() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [shelfFilter, setShelfFilter] = useState('all');
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  
  const [shelves] = useState(getShelves());
  const [owners] = useState(getOwners());
  const [tags] = useState(getTags());
  const [statuses] = useState(getStatuses());

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [packages, searchTerm, statusFilter, ownerFilter, shelfFilter]);

  const loadPackages = () => {
    const data = getPackages();
    setPackages(data);
  };

  const filterPackages = () => {
    let filtered = packages;

    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.shelf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === statusFilter);
    }

    if (ownerFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.owner === ownerFilter);
    }

    if (shelfFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.shelf === shelfFilter);
    }

    setFilteredPackages(filtered);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = getCurrentPagePackages().map(pkg => pkg.id);
      setSelectedPackages(new Set([...selectedPackages, ...currentPageIds]));
    } else {
      const currentPageIds = getCurrentPagePackages().map(pkg => pkg.id);
      setSelectedPackages(new Set([...selectedPackages].filter(id => !currentPageIds.includes(id))));
    }
  };

  const handleSelectPackage = (packageId: string, checked: boolean) => {
    const newSelected = new Set(selectedPackages);
    if (checked) {
      newSelected.add(packageId);
    } else {
      newSelected.delete(packageId);
    }
    setSelectedPackages(newSelected);
  };

  const getCurrentPagePackages = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
  };

  const handleUpdatePackage = (updates: Partial<Package>) => {
    if (editingPackage) {
      updatePackage(editingPackage.id, updates);
      loadPackages();
      setEditingPackage(null);
      toast({
        title: "成功",
        description: "快递信息已更新",
      });
    }
  };

  const handleDeletePackage = (packageId: string) => {
    deletePackage(packageId);
    loadPackages();
    toast({
      title: "成功",
      description: "快递已删除",
    });
  };

  const exportSelectedPackages = () => {
    const selected = packages.filter(pkg => selectedPackages.has(pkg.id));
    if (selected.length === 0) {
      toast({
        title: "提示",
        description: "请先选择要导出的快递",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['序号', '快递单号', '归属人', '货架位置', '标签', '状态', '入库时间', '重量', '备注'],
      ...selected.map((pkg, index) => [
        index + 1,
        pkg.trackingNumber,
        pkg.owner,
        pkg.shelf,
        pkg.tags.join(';'),
        statuses.find(s => s.value === pkg.status)?.label || pkg.status,
        new Date(pkg.entryTime).toLocaleString(),
        pkg.weight || '',
        pkg.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `快递列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "成功",
      description: `已导出 ${selected.length} 条快递记录`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_stock': return 'default';
      case 'pending': return 'secondary';
      case 'out_for_delivery': return 'outline';
      case 'delivered': return 'secondary';
      case 'signed': return 'default';
      case 'deleted': return 'destructive';
      default: return 'outline';
    }
  };

  const currentPagePackages = getCurrentPagePackages();
  const totalPages = getTotalPages();

  return (
    <Layout title="快递列表">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>快递管理</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索快递单号、归属人、货架或标签..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择归属人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有归属人</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={shelfFilter} onValueChange={setShelfFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择货架" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有货架</SelectItem>
                  {shelves.map((shelf) => (
                    <SelectItem key={shelf.id} value={shelf.name}>{shelf.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  共 {filteredPackages.length} 条记录，已选择 {selectedPackages.size} 条
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={exportSelectedPackages}
                  disabled={selectedPackages.size === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出选中
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={currentPagePackages.length > 0 && currentPagePackages.every(pkg => selectedPackages.has(pkg.id))}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left">序号</th>
                    <th className="p-4 text-left">快递单号</th>
                    <th className="p-4 text-left">归属人</th>
                    <th className="p-4 text-left">货架位置</th>
                    <th className="p-4 text-left">标签</th>
                    <th className="p-4 text-left">状态</th>
                    <th className="p-4 text-left">入库时间</th>
                    <th className="p-4 text-left">重量</th>
                    <th className="p-4 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPagePackages.map((pkg, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                      <tr key={pkg.id} className="border-b hover:bg-muted/25">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedPackages.has(pkg.id)}
                            onCheckedChange={(checked) => handleSelectPackage(pkg.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-4 font-medium">{globalIndex}</td>
                        <td className="p-4 font-mono">{pkg.trackingNumber}</td>
                        <td className="p-4">{pkg.owner}</td>
                        <td className="p-4">{pkg.shelf}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {pkg.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(pkg.status)}>
                            {statuses.find(s => s.value === pkg.status)?.label || pkg.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          {new Date(pkg.entryTime).toLocaleString()}
                        </td>
                        <td className="p-4">{pkg.weight ? `${pkg.weight}kg` : '-'}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPackage(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {editingPackage && (
          <Dialog open={true} onOpenChange={() => setEditingPackage(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>编辑快递信息</DialogTitle>
              </DialogHeader>
              <EditPackageForm
                package={editingPackage}
                onSave={handleUpdatePackage}
                onCancel={() => setEditingPackage(null)}
                shelves={shelves}
                owners={owners}
                tags={tags}
                statuses={statuses}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}

// Edit Package Form Component
function EditPackageForm({ 
  package: pkg, 
  onSave, 
  onCancel, 
  shelves, 
  owners, 
  tags, 
  statuses 
}: {
  package: Package;
  onSave: (updates: Partial<Package>) => void;
  onCancel: () => void;
  shelves: any[];
  owners: string[];
  tags: string[];
  statuses: any[];
}) {
  const [formData, setFormData] = useState({
    trackingNumber: pkg.trackingNumber,
    owner: pkg.owner,
    shelf: pkg.shelf,
    tags: pkg.tags,
    status: pkg.status,
    weight: pkg.weight?.toString() || '',
    notes: pkg.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trackingNumber">快递单号</Label>
          <Input
            id="trackingNumber"
            value={formData.trackingNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">重量 (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">归属人</Label>
          <Select 
            value={formData.owner} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shelf">货架位置</Label>
          <Select 
            value={formData.shelf} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, shelf: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shelves.map((shelf) => (
                <SelectItem key={shelf.id} value={shelf.name}>{shelf.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">状态</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
}