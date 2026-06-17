const fs = require("fs");

const file = "components/crpm/CRPMAppNav.tsx";
let s = fs.readFileSync(file, "utf8");

fs.copyFileSync(file, `${file}.before-browser-tabs`);

s = s.replace(/rounded-t-xl/g, "rounded-none");
s = s.replace(/rounded-t-2xl/g, "rounded-none");
s = s.replace(/rounded-xl/g, "rounded-none");
s = s.replace(/rounded-2xl/g, "rounded-none");
s = s.replace(/shadow-sm -mb-px/g, "");
s = s.replace(/shadow-sm/g, "");

s = s.replace(
  /className=\{`([^`]*?)`\}/,
  `className={\`
    flex items-end justify-end gap-0
    -mb-px
  \`}`
);

s = s.replace(
  /className=\{`([^`]*?)\$\{active === item\.key([\s\S]*?)\`\}/,
  `className={\`
    inline-flex items-center gap-2
    h-9 px-6 text-[13px] font-semibold
    border border-slate-300
    border-r-0 last:border-r
    transition
    first:rounded-tl-xl last:rounded-tr-xl
    $\{active === item.key
      ? "bg-white text-slate-950 border-b-white z-10 dark:bg-slate-950 dark:text-white dark:border-b-slate-950"
      : "bg-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    }
  \`}`
);

fs.writeFileSync(file, s);
console.log("Applied browser-style tab navigation:", file);
