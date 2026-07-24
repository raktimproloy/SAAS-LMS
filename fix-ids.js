const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  for (const s of students) {
    if (s.student_id.startsWith('#000')) {
      const newId = s.student_id.replace('#000', '');
      await prisma.student.update({ where: { id: s.id }, data: { student_id: newId } });
    } else if (s.student_id.startsWith('#00')) {
      const newId = s.student_id.replace('#00', '');
      await prisma.student.update({ where: { id: s.id }, data: { student_id: newId } });
    } else if (s.student_id.startsWith('#0')) {
      const newId = s.student_id.replace('#0', '');
      await prisma.student.update({ where: { id: s.id }, data: { student_id: newId } });
    } else if (s.student_id.startsWith('#')) {
      const newId = s.student_id.replace('#', '');
      await prisma.student.update({ where: { id: s.id }, data: { student_id: newId } });
    }
  }
  console.log('Updated students');
}

main().catch(console.error).finally(() => prisma.$disconnect());
