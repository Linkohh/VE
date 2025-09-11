import { MatrixConfig, RenderMode } from './config';

interface Theme {
  color1: string;
  color2: string;
  color3: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function adjust(color: string, amount: number): string {
  const useHash = color.startsWith('#');
  const hex = useHash ? color.slice(1) : color;
  const num = parseInt(hex, 16);
  let r = clamp((num >> 16) + amount);
  let g = clamp(((num >> 8) & 0xff) + amount);
  let b = clamp((num & 0xff) + amount);
  const result = [r, g, b]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('');
  return useHash ? `#${result}` : result;
}

export function colorsFromTheme(theme?: Theme): string[] {
  if (!theme) {
    const styles = getComputedStyle(document.documentElement);
    theme = {
      color1: styles.getPropertyValue('--color1').trim(),
      color2: styles.getPropertyValue('--color2').trim(),
      color3: styles.getPropertyValue('--color3').trim(),
    };
  }

  const palette = [theme.color1, theme.color2, theme.color3]
    .filter(Boolean);

  // Expand to six colors by adding darker variants for depth
  return palette.flatMap((c) => [c, adjust(c, -40)]);
}

export function applyMatrixColors(config: MatrixConfig, theme?: Theme): void {
  const colors = colorsFromTheme(theme);
  config.colors = colors;

  if (config.renderMode === RenderMode.DOM || config.renderMode === RenderMode.HYBRID) {
    const columns = document.querySelectorAll<HTMLElement>('.binary-column');
    columns.forEach((column, index) => {
      const color = config.colors[index % config.colors.length];
      column.style.color = color;
      column.style.textShadow = `0 0 5px ${color}`;
    });
  }

  if (config.renderMode === RenderMode.CANVAS || config.renderMode === RenderMode.HYBRID) {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }
}

