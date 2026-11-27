'use client';

import { useMemo, useState } from 'react';
import {
  AmbientFloaters,
  EFFECT_CATALOG,
  useConfettiPlayer,
  useInviteMusic,
  type AmbientPalettePreset,
} from '@eventlab/effects';

type Flags = {
  petals: boolean;
  hearts: boolean;
  leaves: boolean;
  confetti: boolean;
  music: boolean;
};

const PALETTES: AmbientPalettePreset[] = ['blush', 'gold', 'sage'];

export default function EffectsPlayground() {
  const [flags, setFlags] = useState<Flags>({
    petals: true,
    hearts: true,
    leaves: false,
    confetti: true,
    music: false,
  });
  const [palette, setPalette] = useState<AmbientPalettePreset>('gold');
  const [burst, setBurst] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);

  const play = useConfettiPlayer(flags.confetti);
  const music = useInviteMusic(flags.music, '');

  const ambientOn = flags.petals || flags.hearts || flags.leaves;

  const catalog = useMemo(() => EFFECT_CATALOG, []);

  const toggle = (key: keyof Flags) => setFlags((f) => ({ ...f, [key]: !f[key] }));

  const fireOpen = () => {
    if (flags.music && !musicStarted) {
      music.start();
      setMusicStarted(true);
    }
    if (flags.confetti) play();
    if (flags.hearts) setBurst((n) => n + 1);
  };

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: 'clamp(24px, 5vw, 56px)',
        overflow: 'hidden',
      }}
    >
      {ambientOn ? (
        <AmbientFloaters
          petals={flags.petals}
          hearts={flags.hearts}
          leaves={flags.leaves}
          burst={burst}
          palette={palette}
          zIndex={1}
        />
      ) : null}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          EventLab
        </p>
        <h1
          style={{
            margin: '10px 0 8px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2.6rem, 8vw, 4.2rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
          }}
        >
          Effects
        </h1>
        <p style={{ margin: '0 0 28px', color: 'var(--muted)', maxWidth: 40 * 16, lineHeight: 1.55 }}>
          Thư viện hiệu ứng dùng chung cho mọi template thiệp. Bật tắt bên dưới rồi mở thử — deploy app
          này lên server để xem live.
        </p>

        <section
          style={{
            background: 'var(--panel)',
            border: '1px solid color-mix(in srgb, var(--gold) 35%, transparent)',
            borderRadius: 18,
            padding: '20px 22px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 18px 50px rgba(40, 20, 10, 0.08)',
          }}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {(
              [
                ['petals', 'Cánh hoa rơi'],
                ['hearts', 'Trái tim bay'],
                ['leaves', 'Lá rơi'],
                ['confetti', 'Pháo giấy'],
                ['music', 'Nhạc nền'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '10px 0',
                  borderBottom: '1px solid color-mix(in srgb, var(--ink) 8%, transparent)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{label}</span>
                <input
                  type="checkbox"
                  checked={flags[key]}
                  onChange={() => toggle(key)}
                  style={{ width: 18, height: 18, accentColor: 'var(--rose)' }}
                />
              </label>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>Palette ambient</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PALETTES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${palette === p ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 18%, transparent)'}`,
                    background: palette === p ? 'var(--ink)' : 'transparent',
                    color: palette === p ? 'var(--paper)' : 'var(--ink)',
                    padding: '8px 14px',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
            <button
              type="button"
              onClick={fireOpen}
              style={{
                border: 0,
                borderRadius: 999,
                padding: '12px 22px',
                background: 'linear-gradient(135deg, var(--gold), #a67c1a)',
                color: '#1a1208',
                fontWeight: 600,
              }}
            >
              Mở thiệp (burst)
            </button>
            <button
              type="button"
              onClick={() => play()}
              style={{
                borderRadius: 999,
                border: '1px solid color-mix(in srgb, var(--ink) 20%, transparent)',
                padding: '12px 18px',
                background: 'transparent',
              }}
            >
              Confetti only
            </button>
            {flags.music ? (
              <button
                type="button"
                onClick={() => {
                  if (!musicStarted) {
                    music.start();
                    setMusicStarted(true);
                  } else music.toggleMute();
                }}
                style={{
                  borderRadius: 999,
                  border: '1px solid color-mix(in srgb, var(--ink) 20%, transparent)',
                  padding: '12px 18px',
                  background: 'transparent',
                }}
              >
                {!musicStarted ? 'Phát nhạc' : music.muted ? 'Bật tiếng' : 'Tắt tiếng'}
              </button>
            ) : null}
          </div>
        </section>

        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 600,
            }}
          >
            Catalog
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {catalog.map((effect) => (
              <li
                key={effect.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'color-mix(in srgb, white 55%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ink) 8%, transparent)',
                }}
              >
                <div>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                    {effect.name}
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    {effect.description}
                  </p>
                </div>
                <code style={{ fontSize: 12, color: 'var(--rose)', alignSelf: 'start' }}>
                  {effect.themeKey}
                </code>
              </li>
            ))}
          </ul>
        </section>

        <p style={{ marginTop: 40, fontSize: 13, color: 'var(--muted)' }}>
          Import trong template: <code>import {'{ AmbientFloaters }'} from &apos;@eventlab/effects&apos;</code>
        </p>
      </div>
    </main>
  );
}
