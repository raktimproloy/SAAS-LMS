const fs = require('fs');
const files = [
  'src/app/(admin)/admin/students/page.tsx',
  'src/app/(admin)/admin/courses/page.tsx',
  'src/app/(admin)/admin/payments/page.tsx',
  'src/app/(admin)/admin/materials/page.tsx',
  'src/app/(admin)/admin/exams/page.tsx',
  'src/app/(admin)/admin/assistants/page.tsx',
  'src/app/(admin)/admin/content/page.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace DropdownMenuTrigger
  const triggerRegex = /<DropdownMenuTrigger asChild>[\s\S]*?<MoreHorizontal className="h-4 w-4" \/>[\s\S]*?<\/Button>\s*<\/DropdownMenuTrigger>/g;
  const triggerReplace = `<DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>`;
  content = content.replace(triggerRegex, triggerReplace);

  // Replace DropdownMenuItem asChild in exams/page.tsx
  if (file.includes('exams/page.tsx')) {
    const itemRegex = /<DropdownMenuItem asChild>[\s\S]*?<Link href={`\/admin\/exams\/\$\{exam\.id\}\/questions`}>[\s\S]*?<Settings className="mr-2 h-4 w-4" \/>[\s\S]*?<span>Setup<\/span>[\s\S]*?<\/Link>[\s\S]*?<\/DropdownMenuItem>/g;
    const itemReplace = `<DropdownMenuItem className="p-0">
  <Link href={\`/admin/exams/\${exam.id}/questions\`} className="flex w-full items-center px-2 py-1.5 cursor-pointer">
    <Settings className="mr-2 h-4 w-4" />
    <span>Setup</span>
  </Link>
</DropdownMenuItem>`;
    content = content.replace(itemRegex, itemReplace);
  }
  
  fs.writeFileSync(file, content);
});
console.log('Replaced asChild');
