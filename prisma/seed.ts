/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  await prisma.$executeRaw`TRUNCATE TABLE "Asset", "District" RESTART IDENTITY CASCADE;`;

  // Define 5 Districts in Bandung with approximate bounding boxes
  const districts = [
    { id: 'cuid-district-1', name: 'Sumur Bandung', code: 'SMB', bbox: [107.60, -6.93, 107.62, -6.91] },
    { id: 'cuid-district-2', name: 'Coblong', code: 'CBL', bbox: [107.60, -6.91, 107.62, -6.88] },
    { id: 'cuid-district-3', name: 'Lengkong', code: 'LGK', bbox: [107.61, -6.94, 107.63, -6.92] },
    { id: 'cuid-district-4', name: 'Andir', code: 'AND', bbox: [107.57, -6.92, 107.59, -6.90] },
    { id: 'cuid-district-5', name: 'Kiaracondong', code: 'KRC', bbox: [107.64, -6.93, 107.66, -6.91] },
  ];

  for (const d of districts) {
    const [minLon, minLat, maxLon, maxLat] = d.bbox;
    await prisma.$executeRawUnsafe(`
      INSERT INTO "District" (id, name, code, geometry, "updatedAt")
      VALUES ('${d.id}', '${d.name}', '${d.code}', ST_GeomFromText('POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))', 4326), NOW());
    `);
  }

  // Define 3 Asset Types and realistic names for a Smart City scenario
  const typeConfigs = {
    ROAD: ['CCTV Simpang', 'Lampu Merah Cerdas', 'PJU Pintar LED', 'Sensor Volume Kendaraan'],
    UTILITY: ['Sensor Genangan Air', 'Gardu Distribusi Listrik', 'Stasiun Pompa PDAM', 'Meteran Air Pintar'],
    FACILITY: ['Halte Trans Metro Bandung', 'Puskesmas Pintar', 'Command Center Mini', 'Stasiun Pengisian Kendaraan Listrik'],
  };
  const statuses = ['ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'];

  const typeKeys = Object.keys(typeConfigs) as Array<keyof typeof typeConfigs>;

  for (let i = 0; i < 500; i++) {
    const d = districts[Math.floor(Math.random() * districts.length)];
    const [minLon, minLat, maxLon, maxLat] = d.bbox;
    const lon = minLon + Math.random() * (maxLon - minLon);
    const lat = minLat + Math.random() * (maxLat - minLat);

    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const names = typeConfigs[type];
    const name = names[Math.floor(Math.random() * names.length)] + ' - ' + Math.floor(Math.random() * 1000);
    
    // Weighted status: 80% ACTIVE, 15% MAINTENANCE, 5% DECOMMISSIONED
    const randStat = Math.random();
    const status = randStat > 0.2 ? 'ACTIVE' : (randStat > 0.05 ? 'MAINTENANCE' : 'DECOMMISSIONED');
    
    const id = `cuid-asset-${i + 1}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Asset" (id, name, type, status, "districtId", geometry, address, "updatedAt")
      VALUES 
      ('${id}', '${name}', '${type}', '${status}', '${d.id}', ST_GeomFromText('POINT(${lon} ${lat})', 4326), 'Area ${d.name}', NOW());
    `);
  }

  console.log('Seed Postgres completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
