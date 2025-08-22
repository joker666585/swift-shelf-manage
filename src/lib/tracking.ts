export interface TrackingEvent {
  date: string;
  location: string;
  event: string;
  status: 'completed' | 'current' | 'pending';
}

export interface TrackingResult {
  carrier: string;
  status: string;
  statusText: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  timeline: TrackingEvent[];
}

export class TrackingService {
  static async getTrackingInfo(trackingNumber: string, carrier?: string): Promise<TrackingResult | null> {
    try {
      // 使用17track API进行查询
      const response = await fetch(`https://api.17track.net/track/v2.2/gettrackinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          '17token': '你的17track-API-KEY', // 需要替换为实际的API密钥
        },
        body: JSON.stringify([{
          number: trackingNumber,
          carrier: carrier ? this.getCarrierCode(carrier) : undefined
        }])
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();
      
      if (data.dat && data.dat.length > 0) {
        const trackData = data.dat[0];
        return this.parseTrackingData(trackData);
      }
      
      return null;
    } catch (error) {
      console.error('物流查询失败:', error);
      // 如果API失败，返回模拟数据用于演示
      return this.getMockData(trackingNumber);
    }
  }

  private static getCarrierCode(carrier: string): string {
    const carrierMap: { [key: string]: string } = {
      'DHL': '1001',
      'UPS': '1002', 
      'FedEx': '1003',
      'USPS': '1004',
      'EMS': '1005'
    };
    return carrierMap[carrier] || '';
  }

  private static parseTrackingData(data: any): TrackingResult {
    const events = data.track?.z || [];
    const timeline: TrackingEvent[] = events.map((event: any, index: number) => ({
      date: this.formatDate(event.a),
      location: event.c || '未知位置',
      event: event.z || '状态更新',
      status: index === 0 ? 'current' : 'completed'
    }));

    // 添加预计送达事件
    if (data.track?.w1 && data.track.w1 !== '0') {
      timeline.unshift({
        date: this.formatDate(data.track.w1) + ' (预计)',
        location: data.track.w2 || '目的地',
        event: '预计送达',
        status: 'pending'
      });
    }

    return {
      carrier: this.getCarrierName(data.carrier),
      status: this.getStatusFromCode(data.track?.e),
      statusText: this.getStatusText(data.track?.e),
      origin: timeline[timeline.length - 1]?.location || '未知',
      destination: timeline[0]?.location || '未知',
      estimatedDelivery: data.track?.w1 ? this.formatDate(data.track.w1) : '未知',
      timeline: timeline.reverse()
    };
  }

  private static formatDate(timestamp: string): string {
    if (!timestamp || timestamp === '0') return '';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static getCarrierName(code: string): string {
    const carriers: { [key: string]: string } = {
      '1001': 'DHL',
      '1002': 'UPS',
      '1003': 'FedEx',
      '1004': 'USPS',
      '1005': 'EMS'
    };
    return carriers[code] || '其他';
  }

  private static getStatusFromCode(code: string): string {
    if (!code) return 'unknown';
    const statusMap: { [key: string]: string } = {
      '0': 'not_found',
      '10': 'in_transit',
      '20': 'out_for_delivery',
      '30': 'delivered',
      '40': 'exception'
    };
    return statusMap[code] || 'unknown';
  }

  private static getStatusText(code: string): string {
    const statusTexts: { [key: string]: string } = {
      '0': '暂无信息',
      '10': '运输中',
      '20': '派送中',
      '30': '已签收',
      '40': '异常'
    };
    return statusTexts[code] || '未知状态';
  }

  private static getMockData(trackingNumber: string): TrackingResult | null {
    const mockData: { [key: string]: TrackingResult } = {
      'DHL123456789': {
        carrier: 'DHL',
        status: 'in_transit',
        statusText: '运输中',
        origin: '深圳, 中国',
        destination: '纽约, 美国',
        estimatedDelivery: '2024-01-25',
        timeline: [
          { date: '2024-01-20 14:30', location: '深圳', event: '包裹已发出', status: 'completed' },
          { date: '2024-01-21 08:15', location: '香港转运中心', event: '到达转运中心', status: 'completed' },
          { date: '2024-01-22 16:45', location: '飞行中', event: '已发往目的地', status: 'current' },
          { date: '2024-01-25 (预计)', location: '纽约', event: '预计送达', status: 'pending' }
        ]
      },
      'UPS987654321': {
        carrier: 'UPS',
        status: 'delivered',
        statusText: '已送达',
        origin: '洛杉矶, 美国',
        destination: '上海, 中国',
        estimatedDelivery: '2024-01-22',
        timeline: [
          { date: '2024-01-18 10:00', location: '洛杉矶', event: '包裹已发出', status: 'completed' },
          { date: '2024-01-20 14:30', location: '安克雷奇', event: '转运中心处理', status: 'completed' },
          { date: '2024-01-21 11:20', location: '上海浦东机场', event: '到达目的地', status: 'completed' },
          { date: '2024-01-22 15:45', location: '上海', event: '已成功送达', status: 'completed' }
        ]
      }
    };
    
    return mockData[trackingNumber] || null;
  }
}