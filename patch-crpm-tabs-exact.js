const fs = require("fs");

const file = "components/crpm/CRPMAppNav.tsx";
let s = fs.readFileSync(file, "utf8");

fs.copyFileSync(file, `${file}.before-tabs-exact`);

s = s.replace(
  `<nav className="flex flex-nowrap items-center justify-end gap-2">`,
  `<nav className="flex flex-nowrap items-end justify-end gap-0 -mb-px pr-10">`
);

s = s.replace(
  `isActive
                ? 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-500 bg-white px-3 text-[12px] font-black text-slate-950  transition hover:bg-slate-50 active:translate-y-px'
                : 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-[12px] font-black text-slate-950  transition hover:border-slate-500 hover:bg-slate-50 active:translate-y-px'`,
  `isActive
                ? 'relative z-20 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-slate-300 border-b-white bg-white px-6 text-[12px] font-black text-slate-950 shadow-none transition'
                : 'relative z-10 inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-slate-300 border-r-0 bg-slate-100 px-6 text-[12px] font-black text-slate-600 transition hover:bg-white hover:text-slate-950'`
);

fs.writeFileSync(file, s);
console.log("Applied exact CRPM browser tabs nav patch.");
