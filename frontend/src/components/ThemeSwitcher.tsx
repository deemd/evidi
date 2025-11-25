import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Palette, Check } from 'lucide-react';

export type ThemeColor = 'default' | 'black' | 'blue' | 'green';

interface ThemeSwitcherProps {
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

const themes = [
  { value: 'default' as ThemeColor, label: 'Default', description: 'Light & Dark' },
  { value: 'black' as ThemeColor, label: 'Dark', description: 'Gray dark theme' },
  // { value: 'blue' as ThemeColor, label: 'Deep Blue', description: 'Professional blue' },
  // { value: 'green' as ThemeColor, label: 'Green', description: 'Nature green' },
];

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div>
              <div>{theme.label}</div>
              <div className="text-xs text-primary">{theme.description}</div>
            </div>
            {currentTheme === theme.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
