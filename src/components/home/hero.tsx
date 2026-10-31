"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, Shirt } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const stagger = { hidden: { opacity: 0, y: 16 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i } }) };

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-10 size-[420px] rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-[520px] rounded-full bg-sky-500/15 blur-3xl" />
        <svg className="absolute inset-0 size-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0v36" fill="none" stroke="white" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      </div>
      <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <motion.span custom={0} variants={stagger} initial="hidden" animate="show" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-ink-200">
            <BadgeCheck className="size-3.5 text-brand-400" /> Manufacturer-direct · Sialkot, Pakistan
          </motion.span>
          <motion.h1 custom={1} variants={stagger} initial="hidden" animate="show" className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Custom teamwear, priced <span className="text-brand-400">live</span>. Built for clubs that order in bulk.
          </motion.h1>
          <motion.p custom={2} variants={stagger} initial="hidden" animate="show" className="mt-5 max-w-xl text-base text-ink-300 sm:text-lg">
            Pick a fabric from real Pakistani mills, enter sizes per gender, and see your wholesale price change instantly. Request quotes, pay on terms, and track every order from cutting table to doorstep.
          </motion.p>
          <motion.div custom={3} variants={stagger} initial="hidden" animate="show" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild><Link href="/products">Browse the catalog <ArrowRight /></Link></Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild><Link href="/register">Open a wholesale account</Link></Button>
          </motion.div>
          <motion.dl custom={4} variants={stagger} initial="hidden" animate="show" className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
            {[["10 pcs", "minimum order"], ["15+", "mill fabrics"], ["18–28 days", "typical lead time"]].map(([v, l]) => (
              <div key={l}><dt className="font-display text-xl font-bold text-white sm:text-2xl">{v}</dt><dd className="text-ink-400">{l}</dd></div>
            ))}
          </motion.dl>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-ink-300"><span className="inline-flex items-center gap-1.5"><Shirt className="size-3.5 text-brand-400" /> Pro Match Soccer Jersey</span><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> 21 days</span></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[["Interlock", "$6.35", false], ["Bird-Eye", "$6.90", true], ["Dot-Knit", "$7.40", false]].map(([name, price, active]) => (
                <div key={name as string} className={`rounded-xl border p-2.5 ${active ? "border-brand-400 bg-brand-500/15" : "border-white/10 bg-white/5"}`}><p className="font-semibold text-white">{name}</p><p className="text-ink-300">{price}</p></div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <thead className="bg-white/5 text-ink-300"><tr><th className="px-2 py-1.5 text-left font-medium">Size</th>{["S", "M", "L", "XL", "2XL"].map((s) => <th key={s} className="px-2 py-1.5 font-medium">{s}</th>)}</tr></thead>
                <tbody>
                  {[["Men", [4, 10, 12, 8, 2]], ["Women", [6, 8, 4, 0, 0]]].map(([g, q]) => (
                    <tr key={g as string} className="border-t border-white/10"><td className="px-2 py-1.5 text-left text-ink-300">{g as string}</td>{(q as number[]).map((n, i) => <td key={i} className="px-2 py-1.5 text-center font-semibold text-white">{n || "–"}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div><p className="text-xs text-ink-300">54 pieces · 5% volume discount</p><p className="font-display text-2xl font-bold">$352.08</p></div>
              <span className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold">Add to order</span>
            </div>
          </div>
          <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-white/10 bg-ink-800 px-4 py-3 text-xs shadow-xl sm:block">
            <p className="font-semibold text-emerald-400">● Order LS-240609 shipped</p>
            <p className="text-ink-300">DHL · 3 days to Manchester</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
