const fs = require('fs');
let file = "src/app/(admin)/admin/dashboard/page.tsx";
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/student\.batch\.course\.title/g, 'student.batch?.course?.title');
content = content.replace(/student\.batch\.name/g, 'student.batch?.name');
fs.writeFileSync(file, content);
