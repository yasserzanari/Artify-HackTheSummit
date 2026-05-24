"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { saveUserProfile } from "@/lib/mockAuth";
import type { ArtProfile } from "@/lib/types";

// ── Quiz data ──────────────────────────────────────────────────────────────

const QUESTIONS: {
  text: string;
  choices: { label: string; text: string; profile: ArtProfile }[];
}[] = [
  {
    text: "Qu'est-ce qui t'attire dans un tableau ?",
    choices: [
      { label: "A", text: "La maîtrise technique et l'harmonie classique", profile: "renaissance" },
      { label: "B", text: "L'émotion brute et la liberté du pinceau", profile: "moderne" },
      { label: "C", text: "Les formes pures, les couleurs, sans sujet défini", profile: "abstrait" },
      { label: "D", text: "Les images étranges qui troublent la réalité", profile: "surrealisme" },
    ],
  },
  {
    text: "Ton musée idéal ressemble à ?",
    choices: [
      { label: "A", text: "Des salles aux plafonds dorés, sculptures et fresques", profile: "renaissance" },
      { label: "B", text: "Un espace ouvert avec des toiles expressives et colorées", profile: "moderne" },
      { label: "C", text: "Un cube blanc épuré, œuvres géométriques et minimalistes", profile: "abstrait" },
      { label: "D", text: "Un lieu décalé où chaque salle surprend et désoriente", profile: "surrealisme" },
    ],
  },
  {
    text: "Quelle phrase décrit le mieux ta relation à l'art ?",
    choices: [
      { label: "A", text: "L'art doit représenter la beauté du monde réel", profile: "renaissance" },
      { label: "B", text: "L'art exprime ce que les mots ne peuvent pas dire", profile: "moderne" },
      { label: "C", text: "L'art n'a pas besoin de représenter quoi que ce soit", profile: "abstrait" },
      { label: "D", text: "L'art doit libérer l'inconscient et rêver éveillé", profile: "surrealisme" },
    ],
  },
];

const PROFILE_META: Record<ArtProfile, { name: string; icon: string; description: string }> = {
  renaissance: {
    name: "Renaissance",
    icon: "architecture",
    description: "Tu aimes la maîtrise, l'harmonie et les grands maîtres classiques.",
  },
  moderne: {
    name: "Moderne",
    icon: "brush",
    description: "L'émotion et l'expression te parlent — Van Gogh, Munch, l'art vivant.",
  },
  abstrait: {
    name: "Abstrait",
    icon: "auto_awesome",
    description: "Tu vois au-delà des formes. La couleur et la géométrie sont ton langage.",
  },
  surrealisme: {
    name: "Surréalisme",
    icon: "psychology",
    description: "Le rêve, l'inconscient, l'étrange — tu cherches ce qui dépasse la réalité.",
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ArtQuiz() {
  const router = useRouter();
  const showQuiz = useAuthStore((s) => s.showQuiz);
  const setShowQuiz = useAuthStore((s) => s.setShowQuiz);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const setCategory = useFeedStore((s) => s.setCategory);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ArtProfile[]>([]);
  const [selected, setSelected] = useState<ArtProfile | null>(null);
  const [result, setResult] = useState<ArtProfile | null>(null);
  const [direction, setDirection] = useState(1);

  if (!showQuiz) return null;

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + (selected ? 1 : 0)) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];

    if (!isLast) {
      setDirection(1);
      setAnswers(newAnswers);
      setSelected(null);
      setStep((s) => s + 1);
    } else {
      // Compute winning profile
      const scores: Record<ArtProfile, number> = {
        renaissance: 0,
        moderne: 0,
        abstrait: 0,
        surrealisme: 0,
      };
      newAnswers.forEach((a) => scores[a]++);
      const winner = (
        Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
      ) as ArtProfile;
      saveUserProfile(winner);
      setUserProfile(winner);
      setResult(winner);
    }
  };

  const handleFinish = () => {
    setShowQuiz(false);
    setCategory("All"); // reset manual filter so profile filter kicks in
    // Reset local state for potential future retake
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
    router.push("/discover");
  };

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    const meta = PROFILE_META[result];
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: "#F1E2D1" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          {/* Icon badge */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "#F3E1E8" }}
          >
            <span className="material-icons" style={{ fontSize: "2.5rem", color: "#810B38" }}>
              {meta.icon}
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
            Ton profil artistique
          </p>
          <h1
            className="text-4xl font-bold text-text mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {meta.name}
          </h1>
          <p className="text-sm text-muted leading-relaxed mb-10">
            {meta.description}
          </p>

          <button
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-full font-semibold text-base active:scale-95 transition-transform"
          >
            Découvrir mes œuvres
            <span className="material-icons" style={{ fontSize: "18px" }}>arrow_forward</span>
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#F1E2D1" }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-border shrink-0">
        <motion.div
          className="h-full"
          style={{ backgroundColor: "#810B38" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Question {step + 1} / {QUESTIONS.length}
        </p>
        <p
          className="text-sm font-bold text-text"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Artify<span style={{ color: "#810B38" }}>.</span>
        </p>
      </div>

      {/* Question + choices */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            {/* Question text */}
            <h2
              className="text-2xl font-bold text-text leading-snug mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {question.text}
            </h2>

            {/* Choice cards */}
            <div className="flex flex-col gap-3">
              {question.choices.map((choice) => {
                const isActive = selected === choice.profile;
                return (
                  <button
                    key={choice.label}
                    onClick={() => setSelected(choice.profile)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
                    style={{
                      borderColor: isActive ? "#810B38" : "#C2A07A",
                      backgroundColor: isActive ? "#F3E1E8" : "transparent",
                    }}
                  >
                    {/* Letter badge */}
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        backgroundColor: isActive ? "#810B38" : "#DCC3AA",
                        color: isActive ? "#FFFFFF" : "#6B4A36",
                      }}
                    >
                      {choice.label}
                    </span>
                    <span
                      className="text-sm font-medium leading-snug"
                      style={{ color: isActive ? "#810B38" : "#1A1A1A" }}
                    >
                      {choice.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 shrink-0 max-w-lg mx-auto w-full"
        style={{ paddingBottom: "max(40px, calc(env(safe-area-inset-bottom, 0px) + 24px))" }}
      >
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full py-4 rounded-full font-semibold text-base transition-all active:scale-95"
          style={{
            backgroundColor: selected ? "#810B38" : "#DCC3AA",
            color: selected ? "#FFFFFF" : "#6B4A36",
            cursor: selected ? "pointer" : "default",
          }}
        >
          {isLast ? "Voir mon profil" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
