import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  addPackage, 
  generateId, 
  getLastEntryData, 
  saveLastEntryData,
  getShelves,
  getOwners,
  getTags,
  getStatuses,
  updateShelfCount
} from '@/lib/storage';

export default function PackageEntry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    trackingNumber: '',
    owner: '',
    shelf: '',
    tags: [] as string[],
    status: 'in_stock',
    weight: '',
    notes: ''
  });

  const [shelves] = useState(getShelves());
  const [owners] = useState(getOwners());
  const [tags] = useState(getTags());
  const [statuses] = useState(getStatuses());
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // Load last entry data for quick consecutive entries
    const lastData = getLastEntryData();
    if (lastData.owner || lastData.shelf || lastData.tags?.length) {
      setFormData(prev => ({
        ...prev,
        owner: lastData.owner || '',
        shelf: lastData.shelf || '',
        tags: lastData.tags || [],
        status: lastData.status || 'in_stock'
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trackingNumber.trim()) {
      toast({
        title: "错误",
        description: "请输入快递单号",
        variant: "destructive",
      });
      return;
    }

    const packageData = {
      id: generateId(),
      trackingNumber: formData.trackingNumber.trim(),
      owner: formData.owner,
      shelf: formData.shelf,
      tags: formData.tags,
      status: formData.status as 'in_stock' | 'out_for_delivery' | 'pending' | 'delivered' | 'signed' | 'deleted',
      entryTime: new Date().toISOString(),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes.trim() || undefined
    };

    addPackage(packageData);
    
    // Update shelf count
    if (formData.shelf && formData.status === 'in_stock') {
      updateShelfCount(formData.shelf, 1);
    }

    // Save form data for next entry (excluding tracking number)
    saveLastEntryData({
      owner: formData.owner,
      shelf: formData.shelf,
      tags: formData.tags,
      status: formData.status as any
    });

    toast({
      title: "成功",
      description: "快递信息已录入",
    });

    // Reset only tracking number and notes for quick consecutive entry
    setFormData(prev => ({
      ...prev,
      trackingNumber: '',
      weight: '',
      notes: ''
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectPresetTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  return (
    <Layout title="快递录入">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>录入快递信息</span>
          </CardTitle>
          <CardDescription>
            输入快递详细信息，系统会自动记忆货架位置、归属人等信息以便快速连续录入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">快递单号 *</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="输入快递单号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">重量 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="输入重量"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">归属人</Label>
                <Select 
                  value={formData.owner} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择归属人" />
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
                    <SelectValue placeholder="选择货架位置" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelves.map((shelf) => (
                      <SelectItem key={shelf.id} value={shelf.name}>
                        {shelf.name} - {shelf.location} ({shelf.currentCount}/{shelf.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
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
              <Label>标签</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground">预设标签:</span>
                {tags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => selectPresetTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="输入备注信息"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                录入快递
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/packages')}
              >
                查看列表
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}