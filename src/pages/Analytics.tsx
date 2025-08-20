import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <Layout title="数据统计">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>运营数据分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>数据统计功能开发中...</p>
        </CardContent>
      </Card>
    </Layout>
  );
}