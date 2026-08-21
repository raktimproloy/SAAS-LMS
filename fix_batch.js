const fs = require('fs');
const files = [
  "src/app/api/student/dashboard/route.ts",
  "src/app/api/student/exams/route.ts",
  "src/app/api/student/materials/notes/route.ts",
  "src/app/api/student/materials/videos/route.ts",
  "src/app/api/student/notices/route.ts",
];

for(let f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/student\.batch\.course_id/g, 'student.batch?.course_id ?? -1');
  fs.writeFileSync(f, content);
}
