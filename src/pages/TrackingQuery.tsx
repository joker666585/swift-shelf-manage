import React, { useEffect } from 'react';
import { Truck } from 'lucide-react';
import Layout from '@/components/Layout';

export default function TrackingQuery() {
  useEffect(() => {
    // 动态加载17track脚本
    const script = document.createElement('script');
    script.src = '//www.17track.net/externalcall.js';
    script.async = true;
    script.onload = () => {
      console.log('17track script loaded');
    };
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

  const doTrack = () => {
    const numInput = document.getElementById("YQNum") as HTMLInputElement;
    const num = numInput?.value;
    
    if (num === "") {
      alert("请输入您的快递单号");
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
        YQ_Lang: "cn",
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

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="YQNum" className="block text-sm font-medium text-gray-700 mb-2">
                快递单号
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="YQNum"
                  maxLength={50}
                  placeholder="请输入快递单号"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && doTrack()}
                />
                <button
                  onClick={doTrack}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  查询
                </button>
              </div>
            </div>
            
            {/* 用于显示查询结果的容器 */}
            <div id="YQContainer" className="mt-6 min-h-[400px] border rounded-lg p-4 bg-gray-50"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}