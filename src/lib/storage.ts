// Local storage utility functions for the warehouse management system

export interface Package {
  id: string;
  trackingNumber: string;
  owner: string;
  shelf: string;
  tags: string[];
  status: 'in_stock' | 'out_for_delivery' | 'pending' | 'delivered' | 'signed' | 'deleted';
  entryTime: string;
  weight?: number;
  notes?: string;
}

export interface Shipment {
  id: string;
  packages: Package[];
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    zipCode: string;
  };
  shipmentDate: string;
  status: 'pending' | 'shipped' | 'delivered';
  trackingNumber: string;
}

export interface Shelf {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentCount: number;
}

export interface PriceChannel {
  channel: string;
  country: string;
  weightRange: string;
  billingMethod: string;
  firstWeight: number;
  additionalWeight: number;
  unit: string;
  timeFrame: string;
  notes: string;
}

// Storage keys
const STORAGE_KEYS = {
  PACKAGES: 'warehouse_packages',
  SHIPMENTS: 'warehouse_shipments',
  SHELVES: 'warehouse_shelves',
  OWNERS: 'warehouse_owners',
  TAGS: 'warehouse_tags',
  STATUSES: 'warehouse_statuses',
  PRICE_CHANNELS: 'warehouse_price_channels',
  LAST_ENTRY: 'warehouse_last_entry',
} as const;

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
}

// Package management
export function getPackages(): Package[] {
  return getFromStorage(STORAGE_KEYS.PACKAGES, []);
}

export function savePackages(packages: Package[]): void {
  saveToStorage(STORAGE_KEYS.PACKAGES, packages);
}

export function addPackage(packageData: Package): void {
  const packages = getPackages();
  packages.unshift(packageData); // Add to beginning for newest first
  savePackages(packages);
}

export function updatePackage(id: string, updates: Partial<Package>): void {
  const packages = getPackages();
  const index = packages.findIndex(p => p.id === id);
  if (index !== -1) {
    packages[index] = { ...packages[index], ...updates };
    savePackages(packages);
  }
}

export function deletePackage(id: string): void {
  const packages = getPackages().filter(p => p.id !== id);
  savePackages(packages);
}

// Shipment management
export function getShipments(): Shipment[] {
  return getFromStorage(STORAGE_KEYS.SHIPMENTS, []);
}

export function saveShipments(shipments: Shipment[]): void {
  saveToStorage(STORAGE_KEYS.SHIPMENTS, shipments);
}

export function addShipment(shipment: Shipment): void {
  const shipments = getShipments();
  shipments.unshift(shipment);
  saveShipments(shipments);
}

// Shelf management
export function getShelves(): Shelf[] {
  return getFromStorage(STORAGE_KEYS.SHELVES, [
    { id: '1', name: 'A1', location: 'A区1号', capacity: 100, currentCount: 0 },
    { id: '2', name: 'A2', location: 'A区2号', capacity: 100, currentCount: 0 },
    { id: '3', name: 'B1', location: 'B区1号', capacity: 100, currentCount: 0 },
    { id: '4', name: 'B2', location: 'B区2号', capacity: 100, currentCount: 0 },
  ]);
}

export function saveShelves(shelves: Shelf[]): void {
  saveToStorage(STORAGE_KEYS.SHELVES, shelves);
}

// Preset data management
export function getOwners(): string[] {
  return getFromStorage(STORAGE_KEYS.OWNERS, ['张三', '李四', '王五']);
}

export function saveOwners(owners: string[]): void {
  saveToStorage(STORAGE_KEYS.OWNERS, owners);
}

export function getTags(): string[] {
  return getFromStorage(STORAGE_KEYS.TAGS, ['紧急', '易碎', '重要', '普通']);
}

export function saveTags(tags: string[]): void {
  saveToStorage(STORAGE_KEYS.TAGS, tags);
}

export function getStatuses(): { value: string; label: string }[] {
  return getFromStorage(STORAGE_KEYS.STATUSES, [
    { value: 'in_stock', label: '入库' },
    { value: 'pending', label: '待出库' },
    { value: 'out_for_delivery', label: '出库' },
    { value: 'delivered', label: '已出库' },
    { value: 'signed', label: '已签收' },
    { value: 'deleted', label: '已删除' },
  ]);
}

export function saveStatuses(statuses: { value: string; label: string }[]): void {
  saveToStorage(STORAGE_KEYS.STATUSES, statuses);
}

// Price channels management
export function getPriceChannels(): PriceChannel[] {
  return getFromStorage(STORAGE_KEYS.PRICE_CHANNELS, [
    {
      channel: '美国DHL空运',
      country: '美国',
      weightRange: '0.5-20kg',
      billingMethod: '首重+续重',
      firstWeight: 165,
      additionalWeight: 35,
      unit: '0.5kg',
      timeFrame: '3-5工作日',
      notes: '21-51kg每kg65元，52-101kg每kg60元'
    },
    {
      channel: '美国USPS小包',
      country: '美国',
      weightRange: '0.1-0.5kg',
      billingMethod: '重量计费+操作费',
      firstWeight: 100,
      additionalWeight: 0,
      unit: '公斤',
      timeFrame: '7-15工作日',
      notes: '100元/kg+30元操作费'
    }
  ]);
}

export function savePriceChannels(channels: PriceChannel[]): void {
  saveToStorage(STORAGE_KEYS.PRICE_CHANNELS, channels);
}

// Last entry data for form memory
export function getLastEntryData(): Partial<Package> {
  return getFromStorage(STORAGE_KEYS.LAST_ENTRY, {});
}

export function saveLastEntryData(data: Partial<Package>): void {
  saveToStorage(STORAGE_KEYS.LAST_ENTRY, data);
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function updateShelfCount(shelfName: string, increment: number): void {
  const shelves = getShelves();
  const shelf = shelves.find(s => s.name === shelfName);
  if (shelf) {
    shelf.currentCount = Math.max(0, shelf.currentCount + increment);
    saveShelves(shelves);
  }
}