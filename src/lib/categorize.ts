const KEYWORDS: Record<string, string[]> = {
  Kodinhoito: ['nuohous', 'siivous', 'pesu', 'ikkuna', 'lattia', 'imurointi', 'pyykit'],
  Piha: ['haravointi', 'nurmik', 'puutarha', 'lumi', 'kasvi', 'piha', 'ruoho'],
  Ajoneuvot: ['katsastus', 'huolto', 'rengas', 'öljy', 'auto', 'mopo', 'bensa'],
  Talous: ['vero', 'lasku', 'vakuutus', 'pankki', 'budjetti', 'maksu'],
  Terveys: ['lääkäri', 'hammas', 'resepti', 'rokote', 'tarkastus', 'ajanvaraus'],
}

export function suggestCategory(title: string): string | null {
  const lower = title.toLowerCase()
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return category
  }
  return null
}
