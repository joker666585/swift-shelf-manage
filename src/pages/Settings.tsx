import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Database, Bell, Shield, Download, Upload, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPackages, getShipments, getTags, saveTags, getStatuses, saveStatuses } from '@/lib/storage';

export default function Settings() {
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    notificationsEnabled: true,
    emailNotifications: false,
    lowStockAlert: true,
    lowStockThreshold: 10,
    autoArchive: false,
    archiveAfterDays: 30,
    companyName: '国际快递仓库管理系统',
    companyAddress: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [tags, setTags] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newStatus, setNewStatus] = useState({ value: '', label: '' });

  useEffect(() => {
    setTags(getTags());
    setStatuses(getStatuses());
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('system_settings', JSON.stringify(systemSettings));
    alert('系统设置已保存');
  };

  const handleBackup = () => {
    const packages = getPackages();
    const shipments = getShipments();
    const backupData = {
      packages,
      shipments,
      tags,
      statuses,
      settings: systemSettings,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warehouse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          if (confirm('确定要导入数据吗？这将覆盖现有数据。')) {
            if (backupData.packages) localStorage.setItem('warehouse_packages', JSON.stringify(backupData.packages));
            if (backupData.shipments) localStorage.setItem('warehouse_shipments', JSON.stringify(backupData.shipments));
            if (backupData.tags) saveTags(backupData.tags);
            if (backupData.statuses) saveStatuses(backupData.statuses);
            alert('数据导入成功，请刷新页面');
          }
        } catch (error) {
          alert('导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      if (confirm('最终确认：这将删除所有包裹、发货记录等数据！')) {
        localStorage.clear();
        alert('所有数据已清除，请刷新页面');
      }
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      saveTags(updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    const updatedTags = tags.filter(t => t !== tag);
    setTags(updatedTags);
    saveTags(updatedTags);
  };

  const addStatus = () => {
    if (newStatus.value && newStatus.label && !statuses.find(s => s.value === newStatus.value)) {
      const updatedStatuses = [...statuses, newStatus];
      setStatuses(updatedStatuses);
      saveStatuses(updatedStatuses);
      setNewStatus({ value: '', label: '' });
    }
  };

  const removeStatus = (statusValue: string) => {
    const updatedStatuses = statuses.filter(s => s.value !== statusValue);
    setStatuses(updatedStatuses);
    saveStatuses(updatedStatuses);
  };

  return (
    <Layout title="系统设置">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">常规设置</TabsTrigger>
            <TabsTrigger value="data">数据管理</TabsTrigger>
            <TabsTrigger value="presets">预设管理</TabsTrigger>
            <TabsTrigger value="backup">备份还原</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>基本设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">公司名称</Label>
                    <Input
                      id="companyName"
                      value={systemSettings.companyName}
                      onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">联系邮箱</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={systemSettings.contactEmail}
                      onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">联系电话</Label>
                    <Input
                      id="contactPhone"
                      value={systemSettings.contactPhone}
                      onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">公司地址</Label>
                    <Input
                      id="companyAddress"
                      value={systemSettings.companyAddress}
                      onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>通知设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用通知</Label>
                    <p className="text-sm text-muted-foreground">接收系统通知和提醒</p>
                  </div>
                  <Switch
                    checked={systemSettings.notificationsEnabled}
                    onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>邮件通知</Label>
                    <p className="text-sm text-muted-foreground">通过邮件接收重要通知</p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>库存不足警告</Label>
                    <p className="text-sm text-muted-foreground">当货架空间不足时发送警告</p>
                  </div>
                  <Switch
                    checked={systemSettings.lowStockAlert}
                    onCheckedChange={(checked) => handleSettingChange('lowStockAlert', checked)}
                  />
                </div>
                {systemSettings.lowStockAlert && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="threshold">警告阈值 (%)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      max="100"
                      value={systemSettings.lowStockThreshold}
                      onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>自动化设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动备份</Label>
                    <p className="text-sm text-muted-foreground">定期自动备份系统数据</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>
                {systemSettings.autoBackup && (
                  <div className="ml-6 space-y-2">
                    <Label>备份频率</Label>
                    <Select 
                      value={systemSettings.backupFrequency} 
                      onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">每小时</SelectItem>
                        <SelectItem value="daily">每天</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动归档</Label>
                    <p className="text-sm text-muted-foreground">自动归档旧的已完成记录</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoArchive}
                    onCheckedChange={(checked) => handleSettingChange('autoArchive', checked)}
                  />
                </div>
                {systemSettings.autoArchive && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="archiveDays">归档天数</Label>
                    <Input
                      id="archiveDays"
                      type="number"
                      min="1"
                      value={systemSettings.archiveAfterDays}
                      onChange={(e) => handleSettingChange('archiveAfterDays', parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveSettings}>保存设置</Button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>数据统计</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getPackages().length}</div>
                    <div className="text-sm text-muted-foreground">总包裹数</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{getShipments().length}</div>
                    <div className="text-sm text-muted-foreground">发货记录</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{tags.length}</div>
                    <div className="text-sm text-muted-foreground">标签数量</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Shield className="h-5 w-5" />
                  <span>危险操作</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-medium text-red-800 mb-2">清除所有数据</h4>
                    <p className="text-sm text-red-600 mb-4">
                      这将删除所有包裹、发货记录、设置等数据。此操作不可恢复！
                    </p>
                    <Button variant="destructive" onClick={clearAllData}>
                      清除所有数据
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>标签管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="添加新标签"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag}>添加</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>状态管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="状态值（英文）"
                    value={newStatus.value}
                    onChange={(e) => setNewStatus({ ...newStatus, value: e.target.value })}
                  />
                  <Input
                    placeholder="状态标签（中文）"
                    value={newStatus.label}
                    onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                  />
                </div>
                <Button onClick={addStatus} className="w-full">添加状态</Button>
                <div className="space-y-2">
                  {statuses.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{status.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">({status.value})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStatus(status.value)}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>备份与还原</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">数据备份</h4>
                    <p className="text-sm text-muted-foreground">
                      导出所有系统数据到本地文件，包括包裹、发货记录、设置等。
                    </p>
                    <Button onClick={handleBackup} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      立即备份
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">数据还原</h4>
                    <p className="text-sm text-muted-foreground">
                      从备份文件恢复数据。注意：这将覆盖现有数据。
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        选择备份文件
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-2">备份说明</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 建议定期备份数据以防数据丢失</li>
                    <li>• 备份文件为JSON格式，可用文本编辑器查看</li>
                    <li>• 还原数据前请确保备份文件的完整性</li>
                    <li>• 系统支持跨版本的数据迁移</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}