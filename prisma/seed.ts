import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...')

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@doctorbiology.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@doctorbiology.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: ['all'],
    },
  })
  console.log(`Created super admin: ${admin.email}`)

  // Create initial Courses
  const coursesData = [
    { title: 'SSC', slug: 'ssc', details: 'Secondary School Certificate' },
    { title: 'HSC', slug: 'hsc', details: 'Higher Secondary Certificate' },
    { title: 'Medical Admission', slug: 'medical-admission', details: 'Preparation for Medical Colleges' },
  ]

  for (const course of coursesData) {
    const createdCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    })
    console.log(`Created course: ${createdCourse.title}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
