import { useMemo, useState } from "react";

type Lang = "ua" | "en";

const copy = {
  ua: {
    heading: "Марафон з вайбкодінгу. День 5",
    intro: [
      "Марафон з вайбкодінгу: 10 проєктів, по одному на день, максимум 5 годин.",
      "Легка навчальна штука, щоб перезавантажитися після великих задач.",
      "Це швидкі прототипи, зроблені в темпі 3–4 годин, тож можливі невеличкі лаги.",
    ],
    goalsLabel: "Мета",
    bullets: [
      "Повчитись вайбкодити за допомогою Cursor.",
      "Дослідити, як AI-підхід впливає на темп і якість.",
      "Зрозуміти сильні/слабкі сторони підходу, потенційні продуктові вигоди.",
      "Напрацьовувати нове мислення в реалізації проектів.",
      "Створити проєкти, які хотілося реалізувати, але не було часу й можливостей.",
      "Попрацювати в творчому, спонтанному, необтяжливому ключі.",
      "Накидати проєкти в портфоліо.",
    ],
    toggleCollapse: "Згорнути",
    toggleExpand: "Розгорнути",
  },
  en: {
    heading: "Vibe-coding marathon. Day 5",
    intro: [
      "Vibe-coding marathon: 10 projects, one per day, max 5 hours.",
      "A light learning build to reset after bigger work.",
      "These are quick prototypes built in a 3–4 hour sprint, so minor lags are possible.",
    ],
    goalsLabel: "Goals",
    bullets: [
      "Learn vibe-coding with Cursor.",
      "Explore how the AI-assisted approach affects speed and quality.",
      "Understand the approach’s strengths/weaknesses and product upsides.",
      "Build a new mindset for shipping projects.",
      "Ship projects you wanted to build but lacked time or access to.",
      "Work in a creative, spontaneous, low-pressure flow.",
      "Add quick projects to the portfolio.",
    ],
    toggleCollapse: "Collapse",
    toggleExpand: "Expand",
  },
};

export const MarathonDisclaimer = () => {
  const [lang, setLang] = useState<Lang>("ua");
  const [expanded, setExpanded] = useState(false);

  const t = useMemo(() => copy[lang], [lang]);

  return (
    <div
      className="mb-4 w-full max-w-4xl rounded-xl border border-[#e5b700] bg-[#fff3b0] px-4 py-3 shadow-sm"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-black">{t.heading}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "ua" ? "en" : "ua")}
            className="rounded-md border border-black/20 bg-white/60 px-2 py-1 text-xs font-semibold text-black hover:bg-white"
          >
            {lang === "ua" ? "EN" : "UA"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-black/20 bg-white/60 px-2 py-1 text-xs font-semibold text-black hover:bg-white"
          >
            <span>{expanded ? "▾" : "▸"}</span>
            <span>{expanded ? t.toggleCollapse : t.toggleExpand}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2 text-sm text-black">
          <div className="space-y-1">
            {t.intro.map((line) => (
              <p key={line} className="leading-snug">
                {line}
              </p>
            ))}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-black">
              {t.goalsLabel}
            </div>
            <ul className="mt-1 space-y-1">
              {t.bullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-sm leading-snug text-black"
                >
                  <span className="mt-1 text-xs">✔</span>
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
