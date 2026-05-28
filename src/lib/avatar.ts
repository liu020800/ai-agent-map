// Deterministic pixel avatar generator from seed string
// Generates a symmetric 5x5 pixel art face

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslFromHash(hash: number, index: number): string {
  const h = ((hash >> (index * 3)) + index * 47) % 360;
  const s = 60 + ((hash >> (index * 5)) % 30);
  const l = 45 + ((hash >> (index * 7)) % 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function generateAvatarGrid(seed: string): { grid: boolean[][]; color: string; bgColor: string } {
  const hash = hashCode(seed);
  const size = 5;
  const grid: boolean[][] = [];

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      const bit = (hash >> (y * 3 + x)) & 1;
      row.push(bit === 1);
    }
    // Mirror for symmetry
    const mirrored = [...row, ...row.slice(0, Math.floor(size / 2)).reverse()];
    grid.push(mirrored.slice(0, size));
  }

  return {
    grid,
    color: hslFromHash(hash, 1),
    bgColor: hslFromHash(hash, 3),
  };
}

export function generateAvatarSvg(seed: string, pixelSize = 20): string {
  const { grid, color, bgColor } = generateAvatarGrid(seed);
  const size = grid.length;
  const totalSize = size * pixelSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="${bgColor}" rx="8"/>`;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        svg += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" rx="2"/>`;
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

export function generateCardSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
