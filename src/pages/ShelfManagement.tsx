import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Plus, Edit, Trash2, Users, MapPin, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getShelves, saveShelves, getOwners, saveOwners, Shelf } from '@/lib/storage';

export default function ShelfManagement() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [isAddShelfOpen, setIsAddShelfOpen] = useState(false);
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [editingShelv, setEditingShelf] = useState<Shelf | null>(null);
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [newShelf, setNewShelf] = useState({ name: '', location: '', capacity: 100 });
  const [newOwner, setNewOwner] = useState('');

  useEffect(() => {
    setShelves(getShelves());
    setOwners(getOwners());
  }, []);

  const handleAddShelf = () => {
    if (newShelf.name && newShelf.location) {
      const shelf: Shelf = {
        id: Date.now().toString(),
        name: newShelf.name,
        location: newShelf.location,
        capacity: newShelf.capacity,
        currentCount: 0
      };
      
      const updatedShelves = [...shelves, shelf];
      setShelves(updatedShelves);
      saveShelves(updatedShelves);
      
      setNewShelf({ name: '', location: '', capacity: 100 });
      setIsAddShelfOpen(false);
    }
  };

  const handleEditShelf = (shelf: Shelf) => {
    setEditingShelf(shelf);
    setNewShelf({ name: shelf.name, location: shelf.location, capacity: shelf.capacity });
    setIsAddShelfOpen(true);
  };

  const handleUpdateShelf = () => {
    if (editingShelv && newShelf.name && newShelf.location) {
      const updatedShelves = shelves.map(shelf =>
        shelf.id === editingShelv.id 
          ? { ...shelf, name: newShelf.name, location: newShelf.location, capacity: newShelf.capacity }
          : shelf
      );
      setShelves(updatedShelves);
      saveShelves(updatedShelves);
      
      setEditingShelf(null);
      setNewShelf({ name: '', location: '', capacity: 100 });
      setIsAddShelfOpen(false);
    }
  };

  const handleDeleteShelf = (shelfId: string) => {
    const updatedShelves = shelves.filter(shelf => shelf.id !== shelfId);
    setShelves(updatedShelves);
    saveShelves(updatedShelves);
  };

  const handleAddOwner = () => {
    if (newOwner && !owners.includes(newOwner)) {
      const updatedOwners = [...owners, newOwner];
      setOwners(updatedOwners);
      saveOwners(updatedOwners);
      setNewOwner('');
      setIsAddOwnerOpen(false);
    }
  };

  const handleEditOwner = (owner: string) => {
    setEditingOwner(owner);
    setNewOwner(owner);
    setIsAddOwnerOpen(true);
  };

  const handleUpdateOwner = () => {
    if (editingOwner && newOwner && !owners.includes(newOwner)) {
      const updatedOwners = owners.map(owner => owner === editingOwner ? newOwner : owner);
      setOwners(updatedOwners);
      saveOwners(updatedOwners);
      
      setEditingOwner(null);
      setNewOwner('');
      setIsAddOwnerOpen(false);
    }
  };

  const handleDeleteOwner = (owner: string) => {
    const updatedOwners = owners.filter(o => o !== owner);
    setOwners(updatedOwners);
    saveOwners(updatedOwners);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return { label: '告警', color: 'bg-red-100 text-red-800' };
    if (percentage >= 70) return { label: '繁忙', color: 'bg-yellow-100 text-yellow-800' };
    return { label: '正常', color: 'bg-green-100 text-green-800' };
  };

  const totalCapacity = shelves.reduce((sum, shelf) => sum + shelf.capacity, 0);
  const totalOccupied = shelves.reduce((sum, shelf) => sum + shelf.currentCount, 0);
  const overallUtilization = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

  return (
    <Layout title="货架管理">
      <div className="space-y-6">
        {/* 概览统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">总货架数</p>
                  <p className="text-2xl font-bold">{shelves.length}</p>
                </div>
                <Archive className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">总容量</p>
                  <p className="text-2xl font-bold">{totalCapacity}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">已使用</p>
                  <p className="text-2xl font-bold">{totalOccupied}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">整体利用率</p>
                  <p className={`text-2xl font-bold ${getUtilizationColor(overallUtilization)}`}>
                    {overallUtilization.toFixed(1)}%
                  </p>
                </div>
                <div className="w-full mt-2">
                  <Progress value={overallUtilization} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="shelves" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shelves">货架管理</TabsTrigger>
            <TabsTrigger value="owners">归属人管理</TabsTrigger>
          </TabsList>

          <TabsContent value="shelves" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Archive className="h-5 w-5" />
                    <span>货架列表</span>
                  </div>
                  <Dialog open={isAddShelfOpen} onOpenChange={setIsAddShelfOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        添加货架
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingShelv ? '编辑货架' : '添加货架'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">货架编号</label>
                          <Input
                            value={newShelf.name}
                            onChange={(e) => setNewShelf({ ...newShelf, name: e.target.value })}
                            placeholder="如：A1, B2, C3"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">货架位置</label>
                          <Input
                            value={newShelf.location}
                            onChange={(e) => setNewShelf({ ...newShelf, location: e.target.value })}
                            placeholder="如：A区1号, B区2号"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">容量</label>
                          <Input
                            type="number"
                            value={newShelf.capacity}
                            onChange={(e) => setNewShelf({ ...newShelf, capacity: parseInt(e.target.value) || 100 })}
                            placeholder="货架最大容量"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddShelfOpen(false)}>
                            取消
                          </Button>
                          <Button onClick={editingShelv ? handleUpdateShelf : handleAddShelf}>
                            {editingShelv ? '更新' : '添加'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>货架编号</TableHead>
                      <TableHead>位置</TableHead>
                      <TableHead>容量</TableHead>
                      <TableHead>已使用</TableHead>
                      <TableHead>利用率</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shelves.map((shelf) => {
                      const utilization = (shelf.currentCount / shelf.capacity) * 100;
                      const status = getUtilizationStatus(utilization);
                      
                      return (
                        <TableRow key={shelf.id}>
                          <TableCell className="font-medium">{shelf.name}</TableCell>
                          <TableCell>{shelf.location}</TableCell>
                          <TableCell>{shelf.capacity}</TableCell>
                          <TableCell>{shelf.currentCount}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className={`font-medium ${getUtilizationColor(utilization)}`}>
                                {utilization.toFixed(1)}%
                              </div>
                              <Progress value={utilization} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditShelf(shelf)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteShelf(shelf.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="owners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>归属人管理</span>
                  </div>
                  <Dialog open={isAddOwnerOpen} onOpenChange={setIsAddOwnerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        添加归属人
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingOwner ? '编辑归属人' : '添加归属人'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">归属人姓名</label>
                          <Input
                            value={newOwner}
                            onChange={(e) => setNewOwner(e.target.value)}
                            placeholder="请输入归属人姓名"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddOwnerOpen(false)}>
                            取消
                          </Button>
                          <Button onClick={editingOwner ? handleUpdateOwner : handleAddOwner}>
                            {editingOwner ? '更新' : '添加'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {owners.map((owner, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{owner}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOwner(owner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOwner(owner)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}