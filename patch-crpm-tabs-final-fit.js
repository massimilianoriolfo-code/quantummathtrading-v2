const fs = require("fs");

const file = "components/crpm/CRPMAppNav.tsx";
let s = fs.readFileSync(file, "utf8");

fs.copyFileSync(file, `${file}.before-tabs-final-fit`);

s = s.replace(
  `<nav className="flex flex-nowrap items-end justify-end gap-0 -mb-px pr-10">`,
  `<nav className="relative z-30 flex flex-nowrap items-end justify-end gap-0 -mb-[17px] pr-12">`
);

s = s.replace(
  `? 'relative z-20 -mb-px inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-slate-300 border-b-white bg-white px-4 text-[12px] font-black text-slate-950 shadow-none transition'
                : 'relative z-10 inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-slate-300 border-r-0 bg-slate-100 px-4 text-[12px] font-black text-slate-600 transition hover:bg-white hover:text-slate-950'`,
  `? 'relative z-30 -mb-px inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-slate-300 border-b-white bg-white px-4 text-[12px] font-black text-slate-950 shadow-none transition'
                : 'relative z-20 inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-slate-300 border-r-0 bg-slate-100 px-4 text-[12px] font-black text-slate-600 transition hover:bg-white hover:text-slate-950'`
);

fs.writeFileSync(file, s);
console.log("Final fitted CRPM browser-tabs navigation.");
