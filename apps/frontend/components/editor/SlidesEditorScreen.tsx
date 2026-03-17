import type { ReactNode } from 'react';
import Link from 'next/link';

export type MockSlide = {
  id: string;
  title: string;
};

export type MockBlock = {
  id: string;
  type: 'text' | 'chart';
  content?: string;
  chartLabel?: string;
};

export type SlidesEditorScreenProps = {
  deckTitle?: string;
  slides: MockSlide[];
  selectedSlideId?: string | null;
  blocks: MockBlock[];
  onSelectSlide?: (id: string) => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (id: string) => void;
  onMoveSlideUp?: (id: string) => void;
  onMoveSlideDown?: (id: string) => void;
  rightPanelSlot?: ReactNode;
};

export function SlidesEditorScreen({
  deckTitle = 'Sales dashboard deck',
  slides,
  selectedSlideId,
  blocks,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  rightPanelSlot,
}: SlidesEditorScreenProps) {
  const hasSlides = slides.length > 0;
  const activeSlideId = selectedSlideId ?? (hasSlides ? slides[0]?.id : null);

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        fontFamily: 'system-ui',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <aside
        style={{
          flex: '0 0 240px',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <Link
            href="/edit"
            style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}
          >
            ← Decks
          </Link>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            {deckTitle}
          </p>
        </div>
        <div style={{ padding: '8px', flex: '1 1 0', overflow: 'auto' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600 }}>
            Slides
          </h2>
          <button
            type="button"
            onClick={() => onAddSlide?.()}
            style={{
              padding: '6px 12px',
              marginBottom: '8px',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            + Add slide
          </button>
          {slides.length === 0 ? (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              No slides yet. Use &quot;Add slide&quot; to get started.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {slides.map((slide, index) => (
                <li
                  key={slide.id}
                  style={{
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSlide?.(slide.id)}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: activeSlideId === slide.id ? 600 : 400,
                      backgroundColor:
                        activeSlideId === slide.id
                          ? 'var(--bg-selected)'
                          : 'transparent',
                      border: '1px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <div>Slide {index + 1}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {slide.title}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSlideUp?.(slide.id)}
                    title="Move up"
                    style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSlideDown?.(slide.id)}
                    title="Move down"
                    style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSlide?.(slide.id)}
                    title="Delete slide"
                    style={{
                      padding: '4px 6px',
                      fontSize: '0.75rem',
                      color: 'var(--error)',
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            flexShrink: 0,
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem' }}>Slides editor</h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Mocked deck data for Storybook-only flows.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Ctrl+M: new slide</span>
            <span>Ctrl+D: duplicate</span>
            <span>F5: present</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div
              style={{
                margin: '0 auto',
                maxWidth: 960,
                minHeight: 540,
                borderRadius: 8,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-primary)',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.22)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {!activeSlideId || blocks.length === 0 ? (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  Select a slide and add text or chart blocks to see content here.
                </p>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background:
                        block.type === 'chart'
                          ? 'radial-gradient(circle at top, rgba(56, 189, 248, 0.1), transparent)'
                          : 'transparent',
                    }}
                  >
                    {block.type === 'text' && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '1rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {block.content}
                      </p>
                    )}
                    {block.type === 'chart' && (
                      <div
                        style={{
                          height: 220,
                          borderRadius: 6,
                          border: '1px dashed var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {block.chartLabel ?? 'Chart preview (mock data)'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <aside
        style={{
          flex: '0 0 280px',
          borderLeft: '1px solid var(--border-default)',
          padding: '12px',
          overflow: 'auto',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {rightPanelSlot ?? (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Properties
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              Use this panel for block properties, keyboard shortcuts, or presenter notes.
            </p>
          </>
        )}
      </aside>
    </main>
  );
}

