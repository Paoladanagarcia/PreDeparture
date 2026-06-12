import { useI18n, type Language } from "@/lib/i18n";

const languages: Language[] = ["en", "fr"];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="inline-flex rounded-full border bg-muted/40 p-0.5" aria-label="Language">
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase transition-colors ${
            language === item
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
