const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const res = await prisma.examResult.findMany({
    include: { exam: true }
  });
  console.log(JSON.stringify(res.map(r => ({id: r.id, exam: r.exam.title, type: r.exam.type, rank: r.rank})), null, 2));
}

check().finally(() => prisma.$disconnect());
