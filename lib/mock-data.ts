import { Asset, District } from '@prisma/client';

export const mockDistricts: any[] = [
  { id: 'bdg-coblong', name: 'Coblong', activeIncidents: 12, geometry: { type: 'Polygon', coordinates: [[[107.608, -6.885], [107.618, -6.885], [107.618, -6.895], [107.608, -6.895], [107.608, -6.885]]] } as any, coverageScore: 85, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bdg-sumur-bandung', name: 'Sumur Bandung', activeIncidents: 4, geometry: { type: 'Polygon', coordinates: [[[107.605, -6.915], [107.615, -6.915], [107.615, -6.925], [107.605, -6.925], [107.605, -6.915]]] } as any, coverageScore: 92, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bdg-andir', name: 'Andir', activeIncidents: 7, geometry: { type: 'Polygon', coordinates: [[[107.585, -6.910], [107.595, -6.910], [107.595, -6.920], [107.585, -6.920], [107.585, -6.910]]] } as any, coverageScore: 78, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bdg-lengkong', name: 'Lengkong', activeIncidents: 2, geometry: { type: 'Polygon', coordinates: [[[107.610, -6.930], [107.625, -6.930], [107.625, -6.945], [107.610, -6.945], [107.610, -6.930]]] } as any, coverageScore: 95, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bdg-regol', name: 'Regol', activeIncidents: 5, geometry: { type: 'Polygon', coordinates: [[[107.600, -6.935], [107.610, -6.935], [107.610, -6.945], [107.600, -6.945], [107.600, -6.935]]] } as any, coverageScore: 88, createdAt: new Date(), updatedAt: new Date() },
];

const generateRandomCoordinates = (districtId: string): [number, number] => {
  // Bounding boxes roughly matching the districts in Bandung
  const bounds: Record<string, [number, number, number, number]> = {
    'bdg-coblong': [107.600, -6.900, 107.620, -6.870],
    'bdg-sumur-bandung': [107.600, -6.920, 107.620, -6.910],
    'bdg-andir': [107.570, -6.920, 107.595, -6.900],
    'bdg-lengkong': [107.605, -6.950, 107.630, -6.925],
    'bdg-regol': [107.595, -6.945, 107.610, -6.930],
  };
  
  const b = bounds[districtId] || bounds['bdg-sumur-bandung'];
  const lng = b[0] + Math.random() * (b[2] - b[0]);
  const lat = b[1] + Math.random() * (b[3] - b[1]);
  return [lng, lat];
};

const streetNames = ['Jl. Dago', 'Jl. Merdeka', 'Jl. Braga', 'Jl. Asia Afrika', 'Jl. Riau', 'Jl. Cihampelas', 'Jl. Pasteur', 'Jl. Setiabudi', 'Jl. Cibaduyut', 'Jl. Buah Batu'];
const assetTypes = ['CAMERA', 'STREETLIGHT', 'PARK', 'FACILITY', 'SENSOR', 'UTILITY'];
const statuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export const mockAssets: any[] = Array.from({ length: 300 }).map((_, i) => {
  const district = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];
  const type = assetTypes[Math.floor(Math.random() * assetTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  
  let name = '';
  let meta = {};
  
  if (type === 'CAMERA') {
    name = `CCTV ${street} - Point ${i + 1}`;
    meta = { resolution: '4K', brand: Math.random() > 0.5 ? 'Axis' : 'Hikvision', ip: `192.168.1.${i}` };
  } else if (type === 'STREETLIGHT') {
    name = `PJU Smart LED ${street} #${i + 1}`;
    meta = { wattage: '120W', status: 'Online', dimming: Math.floor(Math.random() * 100) };
  } else if (type === 'PARK') {
    name = `Taman Kota ${street.replace('Jl. ', '')}`;
    meta = { area: `${Math.floor(Math.random() * 5000)}m2`, facilities: ['Bench', 'Trash Can'] };
  } else {
    name = `${type} Node ${i + 1}`;
    meta = { vendor: 'SmartCityInc', firmware: 'v2.1.4' };
  }

  return {
    id: `mock-asset-${i}`,
    name,
    type,
    status,
    location: { type: 'Point', coordinates: generateRandomCoordinates(district.id) },
    metadata: meta,
    districtId: district.id,
    districtName: district.name,
    createdAt: new Date(Date.now() - Math.random() * 10000000000),
    updatedAt: new Date(Date.now() - Math.random() * 10000000),
  };
});

export const getMockSummary = () => {
  const byType = assetTypes.map(t => ({ type: t, count: BigInt(mockAssets.filter(a => a.type === t).length) }));
  const byStatus = statuses.map(s => ({ status: s, count: BigInt(mockAssets.filter(a => a.status === s).length) }));
  
  return {
    total: mockAssets.length,
    byType,
    byStatus
  };
};

export const mockIncidents: any[] = Array.from({ length: 50 }).map((_, i) => {
  const district = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];
  return {
    id: `mock-incident-${i}`,
    type: 'VANDALISM',
    severity: Math.random() > 0.8 ? 'CRITICAL' : 'MINOR',
    status: 'OPEN',
    description: 'Reported issue by citizen',
    location: { type: 'Point', coordinates: generateRandomCoordinates(district.id) },
    createdAt: new Date(),
  };
});
