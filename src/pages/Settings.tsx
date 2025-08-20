import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <Layout title="系统设置">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>系统配置</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>系统设置功能开发中...</p>
        </CardContent>
      </Card>
    </Layout>
  );
}