import React, { useEffect } from 'react';
import { Truck } from 'lucide-react';
import Layout from '@/components/Layout';

export default function TrackingQuery() {
  useEffect(() => {
    // 动态加载17track脚本
    const script = document.createElement('script');
    script.src = '//www.17track.net/externalcall.js';
    script.async = true;
    document.body.appendChild(script);

    // 清理函数
    return () => {
      try {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      } catch (error) {
        console.log('Script cleanup error:', error);
      }
    };
  }, []);

  // 全局函数，供HTML调用
  (window as any).doTrack = () => {
    const numInput = document.getElementById("YQNum") as HTMLInputElement;
    const num = numInput?.value;
    
    if (num === "") {
      alert("Enter your number.");
      return;
    }
    
    // 检查YQV5是否已加载
    if (typeof (window as any).YQV5 !== 'undefined') {
      (window as any).YQV5.trackSingle({
        // 必须，指定承载内容的容器ID
        YQ_ContainerId: "YQContainer",
        // 可选，指定查询结果高度，最大为800px，默认为560px
        YQ_Height: 560,
        // 可选，指定运输商，默认为自动识别
        YQ_Fc: "0",
        // 可选，指定UI语言，默认根据浏览器自动识别
        YQ_Lang: "en",
        // 必须，指定要查询的单号
        YQ_Num: num
      });
    } else {
      alert("查询功能正在加载中，请稍后再试");
    }
  };

  return (
    <Layout title="物流查询">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">物流轨迹查询</h1>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="YQNum" className="block text-sm font-medium text-foreground mb-2">
                快递单号
              </label>
              <div className="flex space-x-2">
                {/* 单号输入框 */}
                <input 
                  type="text" 
                  id="YQNum" 
                  maxLength={50}
                  placeholder="请输入快递单号"
                  className="flex-1 px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
                {/* 用于调用脚本方法的按钮 */}
                <input 
                  type="button" 
                  value="TRACK" 
                  onClick={() => (window as any).doTrack()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer"
                />
              </div>
            </div>
            
            {/* 用于显示查询结果的容器 */}
            <div id="YQContainer" className="mt-6 min-h-[560px] border border-border rounded-lg p-4 bg-muted"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}