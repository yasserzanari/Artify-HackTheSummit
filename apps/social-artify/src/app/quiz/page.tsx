"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/auth";
import { useFeedStore } from "@/store/feed";

const QUESTIONS = [
  {
    q: "What first draws your eye?",
    options: [
      { label: "Faces & expressions", cat: "Portraits" },
      { label: "Dramatic light & shadow", cat: "Baroque" },
      { label: "Harmony & proportion", cat: "Renaissance" },
      { label: "Everything equally", cat: null },
    ],
  },
  {
    q: "Which era speaks to you?",
    options: [
      { label: "Renaissance (1400–1600)", cat: "Renaissance" },
      { label: "Baroque (1600–1750)", cat: "Baroque" },
      { label: "Portraits through the ages", cat: "Portraits" },
      { label: "No preference", cat: null },
    ],
  },
  {
    q: "What subjects captivate you most?",
    options: [
      { label: "Human portraits & figures", cat: "Portraits" },
      { label: "Religious & mythological scenes", cat: "Baroque" },
      { label: "Ancient ideals & mythology", cat: "Renaissance" },
      { label: "All of the above", cat: null },
    ],
  },
  {
    q: "How do you want to experience art?",
    options: [
      { label: "Just looking is enough", cat: null },
      { label: "Learn the history & context", cat: null },
      { label: "See it in 3D & AR", cat: "New 3D" },
      { label: "A mix of everything", cat: null },
    ],
  },
  {
    q: "In a museum, you…",
    options: [
      { label: "Linger at every portrait", cat: "Portraits" },
      { label: "Study the lighting & technique", cat: "Baroque" },
      { label: "Read every description", cat: "Renaissance" },
      { label: "Scan everything with your phone", cat: "New 3D" },
    ],
  },
];

// Tally category votes and return the most selected one
function pickCategory(answers: (string | null)[]): string {
  const tally: Record<string, number> = {};
  for (const cat of answers) {
    if (cat) tally[cat] = (tally[cat] ?? 0) + 1;
  }
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "All";
}

export default function QuizPage() {
  const router = useRouter();
  const { quizDone, setQuizDone } = useAuth();
  const setCategory = useFeedStore((s) => s.setCategory);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [done, setDone] = useState(false);
  const [recommended, setRecommended] = useState("All");

  // Skip quiz if already completed
  useEffect(() => {
    if (quizDone) router.replace("/discover");
  }, [quizDone, router]);

  const pick = (cat: string | null) => {
    const next = [...answers, cat];
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const top = pickCategory(next);
      setRecommended(top);
      setDone(true);
    }
  };

  const finish = () => {
    setCategory(recommended);
    setQuizDone();
    router.push("/discover");
  };

  const skip = () => {
    setQuizDone();
    router.push("/discover");
  };

  const current = QUESTIONS[step];

  return (
    <div className="flex flex-col h-dvh bg-background">
      <div className="flex gap-1.5 px-6 pt-10 pb-3">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= step || done ? "#810B38" : "#C2A07A" }}
          />
        ))}
      </div>

      {!done && (
        <div className="flex justify-end px-6 pb-2">
          <button onClick={skip} className="text-xs font-medium text-muted px-2 py-1">
            Skip
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-6 pb-16 lg:max-w-lg lg:mx-auto lg:w-full">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {step + 1} of {QUESTIONS.length}
              </p>
              <h2
                className="font-bold leading-tight mb-8 text-text"
                style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}
              >
                {current.q}
              </h2>
              <div className="flex flex-col gap-3">
                {current.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => pick(opt.cat)}
                    className="w-full text-left px-5 py-4 rounded-2xl border border-border bg-surface text-text text-sm font-medium transition-all active:scale-[0.98] hover:border-primary hover:bg-background"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-6xl mb-6 select-none">🎨</p>
              <h2
                className="font-bold leading-tight mb-3 text-text"
                style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
              >
                Your taste, curated.
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-2 max-w-xs mx-auto">
                We&apos;ve tailored your feed based on your answers.
              </p>
              {recommended !== "All" && (
                <p className="text-sm font-semibold mb-10" style={{ color: "#810B38" }}>
                  Starting with: {recommended}
                </p>
              )}
              <button
                onClick={finish}
                className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-4 rounded-full bg-primary text-white font-semibold text-base active:scale-95 transition-transform"
              >
                Start discovering
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
