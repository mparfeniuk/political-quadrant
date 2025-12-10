import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import classNames from "classnames";
import {
  axisLabels,
  avatarEmojis,
  economicQuestions,
  quadrantLabels,
  type QuadrantKey,
  socialQuestions,
  type Language,
  type Question,
} from "../data/questions";
import {
  fetchResults,
  jitteredPoint,
  saveResult,
  type SurveyRecord,
} from "../lib/instantdb";
import { quadrantDetails } from "../data/questions";

type Answers = Record<string, number>;

const scaleValues = [1, 2, 3, 4, 5];

const uiText: Record<
  Language,
  {
    title: string;
    description: string;
    socialTitle: string;
    economicTitle: string;
    scaleLeft: string;
    scaleRight: string;
    reset: string;
    yourPoint: string;
    interpretationTitle: string;
    legendTitle: string;
    profileTitle: string;
    nicknamePlaceholder: string;
    nicknameHint: string;
    submit: string;
    saved: string;
    loading: string;
    error: string;
    limitError: string;
  }
> = {
  ua: {
    title: "Політичний квадрат",
    description:
      "30 запитань, що допомагають зрозуміти ваш погляд на роль держави та свободу у соціальній й економічній сферах. Шкала 1–5: 1 — держава не втручається, 5 — держава контролює максимально.",
    socialTitle: "Соціальна сфера (Y)",
    economicTitle: "Економічна сфера (X)",
    scaleLeft: "1 — максимум свободи",
    scaleRight: "5 — максимум контролю держави",
    reset: "Скинути відповіді",
    yourPoint: "Ваша позиція",
    interpretationTitle: "Тлумачення",
    legendTitle: "Квадранти",
    profileTitle: "Профіль перед збереженням",
    nicknamePlaceholder: "Нікнейм (латиниця/цифри/_-, до 20)",
    nicknameHint:
      "Нік може містити латиницю/кирилицю, цифри, пробіли, _ та -, до 20 символів",
    submit: "Зберегти в InstantDB",
    saved: "Збережено! Дані додано на карту",
    loading: "Завантаження даних...",
    error: "Не вдалося зберегти. Спробуйте ще раз.",
    limitError: "Можна зберегти не більше 3 результатів на цьому пристрої.",
  },
  en: {
    title: "Political Quadrant",
    description:
      "30 questions to map your view of the balance between state role and freedom in social and economic spheres. Scale 1–5: 1 — no state control, 5 — full state control.",
    socialTitle: "Social sphere (Y)",
    economicTitle: "Economic sphere (X)",
    scaleLeft: "1 — maximum freedom",
    scaleRight: "5 — maximum state control",
    reset: "Reset answers",
    yourPoint: "Your position",
    interpretationTitle: "Interpretation",
    legendTitle: "Quadrants",
    profileTitle: "Profile before saving",
    nicknamePlaceholder: "Nickname (latin/nums/_-, up to 20)",
    nicknameHint:
      "Nick may include latin/cyrillic, digits, spaces, _ and -, up to 20 chars",
    submit: "Save to InstantDB",
    saved: "Saved! Added to the map",
    loading: "Loading data...",
    error: "Save failed. Please retry.",
    limitError: "You can save up to 3 results on this device.",
  },
};

const NICK_REGEX = /^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9 _-]{1,20}$/;
const SAVE_LIMIT = 3;
const LOCAL_SAVE_COUNT_KEY = "pq_save_count";

function normalize(value: number) {
  return ((value - 1) / 4) * 100;
}

function averageNormalized(values: number[]) {
  if (!values.length) return 0;
  const normalized = values.map((v) => normalize(v));
  return normalized.reduce((acc, v) => acc + v, 0) / normalized.length;
}

function buildInitialAnswers(questions: Question[]) {
  return questions.reduce<Answers>((acc, q) => {
    acc[q.id] = 3;
    return acc;
  }, {});
}

const QuestionCard = ({
  title,
  questions,
  answers,
  onChange,
  lang,
}: {
  title: string;
  questions: Question[];
  answers: Answers;
  onChange: (id: string, value: number) => void;
  lang: Language;
}) => (
  <div className="md:rounded-2xl md:bg-white/70 md:p-6 md:shadow-card md:ring-1 md:ring-slate-100 md:backdrop-blur">
    <div className="mb-4 md:flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="text-xs text-slate-500">
        {lang === "ua"
          ? "1 — свобода · 5 — контроль держави"
          : "1 — freedom · 5 — state control"}
      </div>
    </div>
    <div className="space-y-5">
      {questions.map((question, idx) => (
        <div
          key={question.id}
          className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm"
        >
          <div className="mb-3 text-sm font-medium text-slate-900">
            {idx + 1}. {question.text[lang]}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-xs text-slate-500 md:inline">
              {lang === "ua" ? "менше контролю" : "less control"}
            </span>
            {scaleValues.map((val) => (
              <label
                key={val}
                className={classNames(
                  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition",
                  answers[question.id] === val
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={val}
                  className="sr-only"
                  checked={answers[question.id] === val}
                  onChange={() => onChange(question.id, val)}
                />
                {val}
              </label>
            ))}
            <span className="hidden text-xs text-slate-500 md:inline">
              {lang === "ua" ? "більше контролю" : "more control"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LanguageToggle = ({
  lang,
  onChange,
}: {
  lang: Language;
  onChange: (lang: Language) => void;
}) => (
  <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm">
    {(["ua", "en"] as Language[]).map((code) => (
      <button
        key={code}
        type="button"
        onClick={() => onChange(code)}
        className={classNames(
          "min-w-[2.6rem] rounded-full px-3 py-1 text-sm font-semibold transition",
          lang === code
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-indigo-50"
        )}
      >
        {code.toUpperCase()}
      </button>
    ))}
  </div>
);

export const PoliticalQuadrantSurvey = () => {
  const [language, setLanguage] = useState<Language>("ua");
  const allQuestions = useMemo(
    () => [...socialQuestions, ...economicQuestions],
    []
  );
  const [answers, setAnswers] = useState<Answers>(() =>
    buildInitialAnswers(allQuestions)
  );
  const [nickname, setNickname] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(avatarEmojis[0]);
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [slogan, setSlogan] = useState("");
  const [sloganColor, setSloganColor] = useState("#0f172a");
  const [sloganWeight, setSloganWeight] = useState<"normal" | "bold">("normal");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | null>(
    null
  );
  const [showQuadrantModal, setShowQuadrantModal] = useState(false);
  const [showWatermarks, setShowWatermarks] = useState(true);
  const [saveCount, setSaveCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [toastTimer, setToastTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchResults()
      .then((data) => setRecords(data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_SAVE_COUNT_KEY);
      if (raw) {
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) setSaveCount(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const updateWatermarks = () => {
      if (typeof window !== "undefined") {
        setShowWatermarks(window.innerWidth >= 768);
      }
    };
    updateWatermarks();
    window.addEventListener("resize", updateWatermarks);
    return () => window.removeEventListener("resize", updateWatermarks);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [toastTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#chart") {
      requestAnimationFrame(() => {
        const el = document.getElementById("chart");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ message, type });
    const t = setTimeout(() => setToast(null), 2500);
    setToastTimer(t);
  };

  const socialScore = useMemo(() => {
    const values = socialQuestions.map((q) => answers[q.id]);
    return averageNormalized(values);
  }, [answers]);

  const economicScore = useMemo(() => {
    const values = economicQuestions.map((q) => answers[q.id]);
    return averageNormalized(values);
  }, [answers]);

  const text = uiText[language];

  const handleAnswerChange = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setAnswers(buildInitialAnswers(allQuestions));
  };

  const currentPoint: SurveyRecord = {
    id: "current",
    nickname:
      nickname.trim() ||
      (language === "ua" ? "Ви (чернетка)" : "You (preview)"),
    emoji: selectedEmoji,
    x: economicScore,
    y: socialScore,
    createdAt: new Date().toISOString(),
    language,
  };

  const plottedRecords = useMemo(() => {
    return [
      currentPoint,
      ...records.map((r) => {
        const jitter = jitteredPoint(r);
        return { ...r, ...jitter, baseX: r.x, baseY: r.y };
      }),
    ];
  }, [currentPoint, records]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    const fallbackNick =
      language === "ua" ? "Анонімний користувач" : "Anonymous user";
    const sanitizedNick = nickname.trim() ? nickname.trim() : fallbackNick;
    if (saveCount >= SAVE_LIMIT) {
      setError(text.limitError);
      showToast(text.limitError, "error");
      return;
    }
    if (!NICK_REGEX.test(sanitizedNick)) {
      setError(
        language === "ua"
          ? "Нік: літери лат/кир, цифри, пробіл, _ або -, до 20."
          : "Nick: letters latin/cyrillic, digits, space, _ or -, up to 20."
      );
      showToast(
        language === "ua"
          ? "Нік має бути до 20 символів: літери, цифри, пробіл, _ або -."
          : "Nick must be <=20 chars: letters, digits, space, _ or -.",
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      const saved = await saveResult({
        nickname: sanitizedNick,
        emoji: selectedEmoji,
        x: economicScore,
        y: socialScore,
        language,
        slogan: slogan.trim(),
        sloganColor,
        sloganWeight,
      });
      setRecords((prev) => [saved, ...prev]);
      const nextCount = Math.min(saveCount + 1, SAVE_LIMIT);
      setSaveCount(nextCount);
      try {
        localStorage.setItem(LOCAL_SAVE_COUNT_KEY, String(nextCount));
      } catch {
        // ignore
      }
      setSuccess(true);
      showToast(
        language === "ua"
          ? "Збережено! Дані додано на карту."
          : "Saved! Added to the map.",
        "success"
      );
    } catch (err) {
      console.error(err);
      setError(text.error);
      showToast(text.error, "error");
    } finally {
      setSaving(false);
    }
  };

  const EmojiShape = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <text
        x={cx}
        y={cy}
        fontSize={22}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {payload.emoji || "•"}
      </text>
    );
  };

  const tooltipContent = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-lg">
        <div className="flex items-center gap-2 font-semibold">
          <span>{p.emoji}</span>
          <span>{p.nickname}</span>
          {p.id === "current" && (
            <span className="text-xs text-indigo-600">
              {language === "ua" ? "попередній" : "preview"}
            </span>
          )}
        </div>
        {p.slogan && (
          <div
            className="mt-1 text-xs"
            style={{
              color: p.sloganColor || "#0f172a",
              fontWeight: p.sloganWeight || "normal",
            }}
          >
            {p.slogan}
          </div>
        )}
        <div className="mt-1 text-xs text-slate-600">
          X: {p.baseX?.toFixed?.(1) ?? p.x.toFixed(1)} · Y:{" "}
          {p.baseY?.toFixed?.(1) ?? p.y.toFixed(1)}
        </div>
      </div>
    );
  };

  const watermarkLabels = quadrantLabels[language];
  const quadrantDetail = (key: QuadrantKey) => quadrantDetails[key];
  const xLabelValue =
    showWatermarks || typeof window === "undefined"
      ? axisLabels[language].x
      : language === "ua"
      ? "Економіка: 0—100"
      : "Economy: 0—100";
  const yLabelValue =
    showWatermarks || typeof window === "undefined"
      ? axisLabels[language].y
      : language === "ua"
      ? "Соціальна сфера: 0—100"
      : "Social: 0—100";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 md:px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-start justify-between gap-3 md:block">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {language === "ua" ? "Опитувальник" : "Survey"}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              {text.title}
            </h1>
          </div>
          <div className="shrink-0 md:hidden">
            <LanguageToggle lang={language} onChange={setLanguage} />
          </div>
        </div>
        <div className="hidden md:block">
          <LanguageToggle lang={language} onChange={setLanguage} />
        </div>
      </div>
      <p className="mt-1 flex-1 text-slate-600">{text.description}</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <QuestionCard
          title={text.socialTitle}
          questions={socialQuestions}
          answers={answers}
          onChange={handleAnswerChange}
          lang={language}
        />
        <QuestionCard
          title={text.economicTitle}
          questions={economicQuestions}
          answers={answers}
          onChange={handleAnswerChange}
          lang={language}
        />
      </div>

      <div className="md:rounded-2xl md:bg-white/80 md:p-6 md:shadow-card md:ring-1 md:ring-slate-100 md:backdrop-blur">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {text.profileTitle}
            </h3>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-800">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={text.nicknamePlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              maxLength={20}
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                {language === "ua"
                  ? "Моє політичне гасло"
                  : "My political slogan"}
              </label>
              <textarea
                value={slogan}
                onChange={(e) => setSlogan(e.target.value.slice(0, 100))}
                maxLength={100}
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder={
                  language === "ua"
                    ? "До 100 символів (буде показано в тултіпі)"
                    : "Up to 100 chars (shown in tooltip)"
                }
              />
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <select
                    value={sloganWeight}
                    onChange={(e) =>
                      setSloganWeight(e.target.value as "normal" | "bold")
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="normal">
                      {language === "ua" ? "Звичайний" : "Regular"}
                    </option>
                    <option value="bold">
                      {language === "ua" ? "Жирний" : "Bold"}
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <input
                    type="color"
                    value={sloganColor}
                    onChange={(e) => setSloganColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-md border border-slate-200 bg-white p-1 shadow-sm"
                    aria-label="slogan color"
                  />
                </div>
              </div>

              {error && <div className="text-xs text-red-600">{error}</div>}
              {success && (
                <div className="text-xs text-emerald-600">{text.saved}</div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Emoji avatar
                  </span>
                  <span className="text-xs text-slate-500">
                    {language === "ua"
                      ? "натисніть, щоб обрати"
                      : "tap to select"}
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-2 sm:grid-cols-12">
                  {avatarEmojis.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setSelectedEmoji(emo)}
                      className={classNames(
                        "flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition",
                        selectedEmoji === emo
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-indigo-200"
                      )}
                      aria-label={`avatar ${emo}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:rounded-2xl md:bg-white/80 md:p-5 md:shadow-card md:ring-1 md:ring-slate-100 md:backdrop-blur">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900">
              {text.yourPoint}
            </h4>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              ({economicScore.toFixed(1)} , {socialScore.toFixed(1)})
            </div>
          </div>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 shadow-sm">
              <dt className="font-semibold text-slate-700">
                {language === "ua" ? "Економіка (X)" : "Economy (X)"}
              </dt>
              <dd className="rounded bg-white px-2 py-0.5 font-bold text-slate-900 shadow-sm">
                {economicScore.toFixed(1)}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 shadow-sm">
              <dt className="font-semibold text-slate-700">
                {language === "ua" ? "Соціальна сфера (Y)" : "Social (Y)"}
              </dt>
              <dd className="rounded bg-white px-2 py-0.5 font-bold text-slate-900 shadow-sm">
                {socialScore.toFixed(1)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:rounded-2xl md:bg-white/80 md:p-5 md:shadow-card md:ring-1 md:ring-slate-100 md:backdrop-blur">
          <h4 className="text-base font-semibold text-slate-900">
            {text.legendTitle}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {language === "ua" ? "натисніть для деталей" : "click for details"}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuadrant("topRight");
                  setShowQuadrantModal(true);
                }}
                className="group flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-sm bg-[#fecdd3]" />
                <span className="flex-1 font-medium text-slate-700 group-hover:text-indigo-700">
                  {quadrantLabels[language].topRight}
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                  →
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuadrant("topLeft");
                  setShowQuadrantModal(true);
                }}
                className="group flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-sm bg-[#c7d2fe]" />
                <span className="flex-1 font-medium text-slate-700 group-hover:text-indigo-700">
                  {quadrantLabels[language].topLeft}
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                  →
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuadrant("bottomRight");
                  setShowQuadrantModal(true);
                }}
                className="group flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-sm bg-[#fde68a]" />
                <span className="flex-1 font-medium text-slate-700 group-hover:text-indigo-700">
                  {quadrantLabels[language].bottomRight}
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                  →
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuadrant("bottomLeft");
                  setShowQuadrantModal(true);
                }}
                className="group flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-sm bg-[#bbf7d0]" />
                <span className="flex-1 font-medium text-slate-700 group-hover:text-indigo-700">
                  {quadrantLabels[language].bottomLeft}
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                  →
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div
        id="chart"
        className="md:rounded-2xl md:bg-white/80 md:p-6 md:shadow-card md:ring-1 md:ring-slate-100 md:backdrop-blur"
      >
        <div className="mb-4 md:flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {axisLabels[language].title}
          </h3>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-semibold text-indigo-600 underline-offset-4 hover:underline"
          >
            {text.reset}
          </button>
        </div>

        <div className="h-[320px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                tickCount={6}
                label={{
                  value: xLabelValue,
                  position: "insideBottom",
                  dy: 18,
                  style: {
                    fill: "#475569",
                    fontSize: 11,
                    fontWeight: 500,
                  },
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 100]}
                tickCount={6}
                label={{
                  value: yLabelValue,
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                  style: {
                    fill: "#475569",
                    fontSize: 11,
                    fontWeight: 500,
                    textAnchor: "middle",
                  },
                }}
              />
              <ReferenceArea
                x1={0}
                x2={50}
                y1={50}
                y2={100}
                fill="#c7d2fe"
                fillOpacity={0.18}
              />
              <ReferenceArea
                x1={0}
                x2={50}
                y1={50}
                y2={100}
                fill="transparent"
                label={
                  showWatermarks
                    ? {
                        value: watermarkLabels.topLeft,
                        position: "center",
                        style: {
                          fontSize: 12,
                          fontWeight: 600,
                          fill: "#475569",
                          opacity: 0.55,
                          textAnchor: "middle",
                        },
                      }
                    : undefined
                }
              />
              <ReferenceArea
                x1={50}
                x2={100}
                y1={50}
                y2={100}
                fill="#fecdd3"
                fillOpacity={0.18}
              />
              <ReferenceArea
                x1={50}
                x2={100}
                y1={50}
                y2={100}
                fill="transparent"
                label={
                  showWatermarks
                    ? {
                        value: watermarkLabels.topRight,
                        position: "center",
                        style: {
                          fontSize: 12,
                          fontWeight: 600,
                          fill: "#475569",
                          opacity: 0.55,
                          textAnchor: "middle",
                        },
                      }
                    : undefined
                }
              />
              <ReferenceArea
                x1={0}
                x2={50}
                y1={0}
                y2={50}
                fill="#bbf7d0"
                fillOpacity={0.18}
              />
              <ReferenceArea
                x1={0}
                x2={50}
                y1={0}
                y2={50}
                fill="transparent"
                label={
                  showWatermarks
                    ? {
                        value: watermarkLabels.bottomLeft,
                        position: "center",
                        style: {
                          fontSize: 12,
                          fontWeight: 600,
                          fill: "#475569",
                          opacity: 0.55,
                          textAnchor: "middle",
                        },
                      }
                    : undefined
                }
              />
              <ReferenceArea
                x1={50}
                x2={100}
                y1={0}
                y2={50}
                fill="#fde68a"
                fillOpacity={0.18}
              />
              <ReferenceArea
                x1={50}
                x2={100}
                y1={0}
                y2={50}
                fill="transparent"
                label={
                  showWatermarks
                    ? {
                        value: watermarkLabels.bottomRight,
                        position: "center",
                        style: {
                          fontSize: 12,
                          fontWeight: 600,
                          fill: "#475569",
                          opacity: 0.55,
                          textAnchor: "middle",
                        },
                      }
                    : undefined
                }
              />
              <ReferenceLine
                x={50}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                label={{
                  value: "50",
                  position: "top",
                  fill: "#475569",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                label={{
                  value: "50",
                  position: "left",
                  fill: "#475569",
                  fontSize: 12,
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={tooltipContent}
              />
              <Scatter
                name={text.yourPoint}
                data={plottedRecords}
                fill="#4f46e5"
                shape={EmojiShape}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {loading && (
          <div className="text-sm text-slate-500">{text.loading}</div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loading}
          title={
            language === "ua"
              ? "При збереженні ваш вибір зможуть побачити інші"
              : "When saved, others will see your choice"
          }
          className="inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {language === "ua" ? "Зберегти свої дані" : "Save my data"}
        </button>
      </div>

      {showQuadrantModal && selectedQuadrant && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-slate-900/30 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-lg bg-white shadow-2xl ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setShowQuadrantModal(false)}
              className="absolute right-3 top-3 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200"
            >
              {language === "ua" ? "Закрити" : "Close"}
            </button>
            <div className="overflow-y-auto p-6 pb-10">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
                {language === "ua" ? "Деталі квадранта" : "Quadrant details"}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {quadrantDetail(selectedQuadrant).title[language]}
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {quadrantDetail(selectedQuadrant).description[language]}
              </p>

              {selectedQuadrant === "bottomLeft" && (
                <div className="mt-3">
                  <a
                    href="https://www.wellbooks.com.ua/shop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-indigo-700 underline-offset-4 transition hover:bg-slate-200 hover:underline"
                  >
                    {language === "ua"
                      ? "більше про цінності лібералізму тут"
                      : "more about liberal values here"}
                  </a>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {language === "ua" ? "Приклади держав" : "Example states"}
                  </h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {quadrantDetail(selectedQuadrant).states[language].map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {language === "ua" ? "Відомі діячі" : "Notable figures"}
                  </h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {quadrantDetail(selectedQuadrant).figures[language].map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            className={`max-w-lg rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      )}
    </div>
  );
};
