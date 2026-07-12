// Core ScopeWork Types

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Contractor {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  rates: ContractorRate[];
}

export interface ContractorRate {
  id: string;
  contractorId: string;
  repairType: string;       // e.g. "Drywall repair", "Paint room"
  unit: string;             // e.g. "per sq ft", "per room", "flat"
  price: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'archived';
  photos: Photo[];
  repairItems: RepairItem[];
  estimate?: Estimate;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  projectId: string;
  url: string;
  aiAnalysis?: PhotoAnalysis;
  createdAt: Date;
}

export interface PhotoAnalysis {
  quality: 'good' | 'needs_improvement';
  feedback?: string;          // e.g. "Get closer to the water damage"
  detectedRepairs: DetectedRepair[];
}

export interface DetectedRepair {
  type: string;               // e.g. "Water damage", "Cracked drywall"
  severity: 'minor' | 'moderate' | 'major';
  location: string;           // e.g. "Ceiling, master bedroom"
  confidence: number;         // 0–1
}

export interface RepairItem {
  id: string;
  projectId: string;
  description: string;
  repairType: string;
  severity: 'minor' | 'moderate' | 'major';
  quantity?: number;
  unit?: string;
  materials?: Material[];
  laborCost?: number;
  materialCost?: number;
  totalCost?: number;
}

export interface Material {
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  source: 'homedepot' | 'manual';
  url?: string;
}

export interface Estimate {
  projectId: string;
  laborTotal: number;
  materialsTotal: number;
  grandTotal: number;
  generatedAt: Date;
  contractorId?: string;
}
