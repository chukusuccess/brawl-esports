// Server-side helper for a future Brawlhalla API route or scheduled sync.
// Keep BRAWLHALLA_API_KEY server-only; never prefix it with NEXT_PUBLIC_.

export interface LiveStat {
  brawlhallaId: string;
  name: string | null;
  rating: number | null;
  peakRating: number | null;
  tier: string | null;
  error?: string;
}

export async function getBrawlhallaRanked(brawlhallaId: string): Promise<LiveStat> {
  const fallback = (error: string): LiveStat => ({
    brawlhallaId,
    name: null,
    rating: null,
    peakRating: null,
    tier: null,
    error,
  });

  const apiKey = process.env.BRAWLHALLA_API_KEY;
  if (!apiKey) return fallback("API key not configured");

  try {
    const response = await fetch(
      `https://api.brawlhalla.com/player/${encodeURIComponent(brawlhallaId)}/ranked?api_key=${apiKey}`,
      { cache: "no-store" },
    );
    if (!response.ok) return fallback(`Upstream ${response.status}`);

    const payload = (await response.json()) as {
      name?: string;
      rating?: number;
      peak_rating?: number;
      tier?: string;
    };
    return {
      brawlhallaId,
      name: payload.name ?? null,
      rating: payload.rating ?? null,
      peakRating: payload.peak_rating ?? null,
      tier: payload.tier ?? null,
    };
  } catch (error) {
    return fallback(error instanceof Error ? error.message : "Fetch failed");
  }
}
