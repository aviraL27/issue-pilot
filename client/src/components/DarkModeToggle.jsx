import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('issuepilot_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('issuepilot_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((value) => !value)}
      className="inline-flex h-8 w-8 items-center justify-center rounded-badge border border-line bg-white text-ink hover:border-available dark:border-[#30363D] dark:bg-[#161B22] dark:text-white"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
