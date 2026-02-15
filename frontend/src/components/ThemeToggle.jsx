import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, themes, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="theme-picker">
        Theme picker
      </label>
      <select
        id="theme-picker"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="input-modern h-9 min-w-32 bg-white/60 px-2.5 py-1 text-xs font-medium capitalize md:hidden"
      >
        {themes.map((name) => (
          <option key={name} value={name}>
            {name.replace('-', ' ')}
          </option>
        ))}
      </select>

      <div className="hidden items-center gap-1 rounded-full border border-white/40 bg-white/50 px-1 py-1 text-xs shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 md:flex">
        {themes.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTheme(name)}
            className={`rounded-full px-2 py-1 font-medium capitalize transition ${
              name === theme ? 'accent-bg' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {name.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
