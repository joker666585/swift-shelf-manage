import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export default function PricingQuery() {
  return (
    <Layout title="报价查询">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>运费报价查询</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>报价查询功能开发中...</p>
        </CardContent>
      </Card>
    </Layout>
  );
}