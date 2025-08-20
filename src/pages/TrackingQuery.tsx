import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function TrackingQuery() {
  return (
    <Layout title="物流查询">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>物流轨迹查询</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>物流查询功能开发中...</p>
        </CardContent>
      </Card>
    </Layout>
  );
}