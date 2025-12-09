import { PoliticalQuadrantSurvey } from "./components/PoliticalQuadrantSurvey";
import { MarathonDisclaimer } from "./components/MarathonDisclaimer";

function App() {
  return (
    <div className="px-4 py-4 flex flex-col items-center">
      <div className="w-full flex justify-center">
        <MarathonDisclaimer />
      </div>
      <PoliticalQuadrantSurvey />
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">
          Day 5. Vibe coding marathon.
        </span>
        <a
          href="https://www.linkedin.com/in/mparfeniuk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-700 underline-offset-4 hover:underline"
        >
          Author Max Parfeniuk
        </a>
      </footer>
    </div>
  );
}

export default App;
