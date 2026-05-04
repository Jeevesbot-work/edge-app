"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRINCIPLES = [
  {
    number: "01",
    title: "Protein First",
    body: "Hit 1.6–2g of protein per kg of bodyweight. Every single day. This is the one macro that matters most. Everything else is secondary.",
  },
  {
    number: "02",
    title: "Eat Real Food",
    body: "If it came from the ground, a tree, or an animal, eat it. If it came from a factory, minimise it. Not complicated. Just consistent.",
  },
  {
    number: "03",
    title: "Hydration",
    body: "3 litres of water a day minimum. Before coffee. Before anything else. Dehydration kills performance and mimics hunger.",
  },
  {
    number: "04",
    title: "Timing",
    body: "Eat something solid within 2 hours of training. Protein and carbs post-session. Don't overcomplicate it — eat real food close to your workouts.",
  },
  {
    number: "05",
    title: "Alcohol Awareness",
    body: "Alcohol wrecks sleep quality for 48 hours even in small amounts. It elevates cortisol and suppresses testosterone. Know the cost before you pay it.",
  },
];

export default function NutritionPage() {
  const router = useRouter();
  const [protein, setProtein] = useState(0);
  const TARGET = 160;

  return (
    <div className="min-h-screen bg-edge-bg max-w-lg mx-auto px-4 pt-safe pb-24">
      <div className="flex items-center gap-3 py-4 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-condensed font-black text-2xl uppercase tracking-wide">Nutrition</h1>
      </div>

      {/* Protein tracker */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-1">Daily Protein</p>
            <div className="flex items-baseline gap-1">
              <span className="font-condensed font-black text-4xl text-white">{protein}</span>
              <span className="text-edge-muted text-sm">/ {TARGET}g</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-edge-muted text-xs font-condensed">
              {protein >= TARGET ? (
                <span className="text-green-400">Target hit</span>
              ) : (
                <span>{TARGET - protein}g to go</span>
              )}
            </p>
          </div>
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((protein / TARGET) * 100, 100)}%`,
              backgroundColor: protein >= TARGET ? "#10B981" : "#E8291C",
            }}
          />
        </div>

        {/* Quick add buttons */}
        <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-2">Quick Add</p>
        <div className="grid grid-cols-4 gap-2">
          {[20, 30, 40, 50].map((g) => (
            <button
              key={g}
              onClick={() => setProtein((p) => Math.min(p + g, 300))}
              className="bg-edge-bg border border-white/10 rounded-lg py-2 text-center font-condensed font-bold text-sm text-white active:bg-white/5"
            >
              +{g}g
            </button>
          ))}
        </div>
        <button
          onClick={() => setProtein(0)}
          className="w-full mt-2 text-edge-muted text-xs underline"
        >
          Reset
        </button>
      </div>

      {/* Ask Edge */}
      <Link href="/edge">
        <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 flex items-center gap-4 mb-6 active:bg-white/5">
          <div className="w-10 h-10 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0">
            <span className="font-condensed font-black text-sm text-edge-bg">E</span>
          </div>
          <div className="flex-1">
            <p className="font-condensed font-bold text-sm uppercase tracking-wide">Ask Edge</p>
            <p className="text-edge-muted text-xs">Pre-workout meals, travel food, what to eat on rest days...</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Eat Strong Principles */}
      <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
        The Eat Strong Principles
      </h2>
      <div className="space-y-3">
        {PRINCIPLES.map((p) => (
          <div key={p.number} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <span className="font-condensed font-black text-2xl text-edge-red leading-none flex-shrink-0 w-8">
                {p.number}
              </span>
              <div>
                <p className="font-condensed font-bold text-base uppercase tracking-wide text-white mb-1">{p.title}</p>
                <p className="text-white/70 font-body text-sm leading-relaxed">{p.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
