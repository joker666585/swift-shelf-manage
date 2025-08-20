import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export default function ShelfManagement() {
  return (
    <Layout title="货架管理">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5" />
            <span>仓储货架管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>货架管理功能开发中...</p>
        </CardContent>
      </Card>
    </Layout>
  );
}