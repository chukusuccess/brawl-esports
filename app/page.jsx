"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contentStore } from "@/lib/community-data";
import ThemeToggle from "@/components/theme-toggle";

const rankColors = {
  Valhallan: "#7c3aed",
  Diamond: "#6d52b7",
  Platinum: "#177fc1",
  Gold: "#bd7a05",
  Silver: "#64748b",
  Bronze: "#b65b2f",
  Tin: "#667085",
  Noob: "#667085",
};

const rankBannerUrls = {
  Tin: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Tin.png/93px-Banner_Rank_Tin.png?9c8a65",
  Bronze: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Bronze.png/93px-Banner_Rank_Bronze.png?dade23",
  Silver: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Silver.png/99px-Banner_Rank_Silver.png?22119f",
  Gold: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Gold.png/90px-Banner_Rank_Gold.png?78265f",
  Platinum: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Platinum.png/84px-Banner_Rank_Platinum.png?f659ec",
  Diamond: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Diamond.png/70px-Banner_Rank_Diamond.png?1ab9b9",
  Valhallan: "https://brawlhalla.wiki.gg/images/thumb/Banner_Rank_Valhallan.png/66px-Banner_Rank_Valhallan.png?b723c6",
};

function useCommunityContent() {
  const [content, setContent] = useState(() => contentStore.get());

  useEffect(() => {
    const unsubscribe = contentStore.subscribe(setContent);
    const stopRemoteSync = contentStore.startRemoteSync();
    setContent(contentStore.get());

    return () => {
      unsubscribe();
      stopRemoteSync();
    };
  }, []);

  return content;
}

function formatDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.valueOf())
    ? date
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>;
}

function DiscordIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>;
}

export default function HomePage() {
  const content = useCommunityContent();
  const players = useMemo(
    () => [...content.members].sort((a, b) => b.peakElo - a.peakElo),
    [content.members],
  );
  const events = useMemo(
    () => [...content.events].sort((a, b) => b.date.localeCompare(a.date)),
    [content.events],
  );

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="AfroBrawlers home">
          <span className="brand-mark">AB</span>
          <span>AFROBRAWLERS</span>
        </Link>
        <div className="topbar-actions">
          <a className="quiet-link" href="#hall">Leaderboard</a>
          <ThemeToggle />
          <Link className="admin-link" href="/admin">Admin</Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="motion-in">
            <span className="eyebrow">ONE CONTINENT · ONE ARENA</span>
            <h1>
              Built to <em>brawl.</em>
              <br />Made to belong.
            </h1>
            <p className="hero-copy">{content.about}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={content.links.discord} target="_blank" rel="noreferrer">
                Enter the Discord&nbsp; ↗
              </a>
              <a className="button button-secondary" href={content.links.whatsapp} target="_blank" rel="noreferrer">
                Join WhatsApp&nbsp; ↗
              </a>
            </div>
          </div>

          <div className="arena-card motion-in motion-delay-2" aria-label="AfroBrawlers community at a glance">
            <span className="arena-kicker"><span className="pulse-dot" />LIVE FROM AFRICA</span>
            <strong className="arena-name">The arena is open</strong>
            <div className="arena-stats">
              <div className="stat-chip"><strong>{content.members.length}</strong><span>HALL OF FAME</span></div>
              <div className="stat-chip"><strong>{content.countries.length}</strong><span>COUNTRIES REPPED</span></div>
            </div>
          </div>
        </section>

        <div className="content-wrap">
          <section className="section motion-in motion-delay-1" aria-labelledby="join-title">
            <div className="section-intro">
              <div><p className="section-kicker">PULL UP</p><h2 id="join-title">Find your people.</h2></div>
              <p className="section-note">Run sets, find doubles partners, talk tech, or simply enjoy good Brawlhalla company.</p>
            </div>
            <div className="join-grid">
              <a className="join-card" style={{ "--accent": "#1d7459" }} href={content.links.whatsapp} target="_blank" rel="noreferrer">
                <span className="join-icon whatsapp-icon"><WhatsAppIcon /></span><span className="arrow">↗</span><h3>WhatsApp</h3><p>Daily scrims, game-night pings, and the banter.</p>
              </a>
              <a className="join-card" style={{ "--accent": "#6d52b7" }} href={content.links.discord} target="_blank" rel="noreferrer">
                <span className="join-icon discord-icon"><DiscordIcon /></span><span className="arrow">↗</span><h3>Discord</h3><p>Voice rooms, brackets, VODs, and match talk.</p>
              </a>
            </div>
          </section>

          <section className="section" id="hall" aria-labelledby="hall-title">
            <div className="section-intro">
              <div><p className="section-kicker">HALL OF FAME</p><h2 id="hall-title">Top of the bracket.</h2></div>
              <p className="section-note">Peak Elo is community-submitted and maintained by the AfroBrawlers admin team.</p>
            </div>
            <div className="leaderboard">
              <div className="leaderboard-head"><span>Player</span><span>Peak Elo</span><span>Rank</span><span>Community role</span></div>
              {players.map((player) => (
                <div className="player-row" key={player.id}>
                  <div className="player"><img className="rank-banner" src={rankBannerUrls[player.rank] || rankBannerUrls.Tin} alt={`${player.rank} rank banner`} /><span><strong className="player-name">{player.ign}</strong><small className="player-country">{player.country}</small></span></div>
                  <span className="elo">{player.peakElo}</span>
                  <span className="rank" style={{ "--rank": rankColors[player.rank] || "#667085" }}>{player.rank}</span>
                  <span className="role">{player.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" aria-labelledby="countries-title">
            <div className="section-intro">
              <div><p className="section-kicker">THE NETWORK</p><h2 id="countries-title">Across the continent.</h2></div>
              <p className="section-note">Every flag is another place to call for a set.</p>
            </div>
            <div className="country-grid">
              {content.countries.map((country) => <div className="country-card" key={country.id}><span>{country.flag}</span><strong>{country.name}</strong></div>)}
            </div>
          </section>

          <section className="section" aria-labelledby="events-title">
            <div className="section-intro">
              <div><p className="section-kicker">ON DECK</p><h2 id="events-title">Moments worth running back.</h2></div>
              <p className="section-note">Tournament history, LAN stories, and the next event on the calendar.</p>
            </div>
            <div className="events-grid">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <time className="event-date" dateTime={event.date}>{formatDate(event.date)}</time>
                  <h3>{event.title}</h3><p>{event.summary}</p>
                  <div className="event-meta">{event.winner && <span>Winner: {event.winner}</span>}{event.participants && <span>{event.participants} players</span>}</div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">© {new Date().getFullYear()} AfroBrawlers. Built by the community, for the community.</footer>
    </div>
  );
}
