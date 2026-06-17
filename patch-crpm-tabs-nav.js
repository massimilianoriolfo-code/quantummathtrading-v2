const fs = require("fs");

const file = "components/crpm/CRPMAppNav.tsx";
let s = fs.readFileSync(file, "utf8");

fs.copyFileSync(file, `${file}.before-tabs-nav`);

s = s.replace(
  /className=\{`([^`]*?)`\}/g,
  (m) => m
);

s = s.replace(
  /rounded-xl/g,
  "rounded-t-xl"
);

s = s.replace(
  /rounded-2xl/g,
  "rounded-t-2xl"
);

s = s.replace(
  /border border-slate-200\/70/g,
  "border border-slate-200/70 border-b-0"
);

s = s.replace(
  /dark:border-slate-800\/80/g,
  "dark:border-slate-800/80"
);

s = s.replace(
  /shadow-sm/g,
  "shadow-sm -mb-px"
);

fs.writeFileSync(file, s);
console.log("Patched tab-style navigation in", file);
