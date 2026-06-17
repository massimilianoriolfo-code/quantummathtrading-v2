const fs = require("fs");

const file = "components/crpm/CRPMAppNav.tsx";
let s = fs.readFileSync(file, "utf8");

fs.copyFileSync(file, `${file}.before-tabs-refine`);

s = s.replace(
  `? 'relative z-20 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-slate-300 border-b-white bg-white px-6 text-[12px] font-black text-slate-950 shadow-none transition'
                : 'relative z-10 inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-slate-300 border-r-0 bg-slate-100 px-6 text-[12px] font-black text-slate-600 transition hover:bg-white hover:text-slate-950'`,
  `? 'relative z-20 -mb-px inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-slate-300 border-b-white bg-white px-4 text-[12px] font-black text-slate-950 shadow-none transition'
                : 'relative z-10 inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-slate-300 border-r-0 bg-slate-100 px-4 text-[12px] font-black text-slate-600 transition hover:bg-white hover:text-slate-950'`
);

fs.writeFileSync(file, s);
console.log("Refined CRPM tabs nav.");
