import Link from 'next/link';
import {
  AppBar,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@/lib/material-ui-shim';

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`size-6 shrink-0 text-accent-primary ${className}`.trim()}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        clipRule="evenodd"
        d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function FeatureGlyph({ children }: { children: React.ReactNode }) {
  return (
    <Box
      className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-bg-primary text-accent-primary shadow-sm"
      aria-hidden
    >
      {children}
    </Box>
  );
}

export function LandingPage() {
  return (
    <Box className="flex min-h-screen flex-col bg-bg-secondary text-text-primary">
      <AppBar position="fixed" variant="medium" className="border-b border-border-default bg-bg-primary/95 backdrop-blur-md">
        <Box className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-between gap-4 px-4 md:px-10">
          <Link href="/" className="flex items-center gap-3 no-underline text-inherit">
            <LogoMark />
            <Typography variant="h6" component="span" className="font-bold tracking-tight text-text-primary">
              Interactive Presentation
            </Typography>
          </Link>
          <Box className="flex flex-1 items-center justify-end gap-6 md:gap-8">
            <Box component="nav" className="hidden items-center gap-8 md:flex" aria-label="Marketing">
              <a
                href="#features"
                className="text-sm font-medium text-text-primary no-underline transition-colors duration-[150ms] hover:text-accent-primary"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-text-primary no-underline transition-colors duration-[150ms] hover:text-accent-primary"
              >
                Pricing
              </a>
              <Link
                href="/login"
                className="text-sm font-medium text-text-primary no-underline transition-colors duration-[150ms] hover:text-accent-primary"
              >
                Log in
              </Link>
            </Box>
            <Link href="/register">
              <Button variant="filled" className="min-w-[7rem] shadow-sm">
                Register
              </Button>
            </Link>
          </Box>
        </Box>
      </AppBar>

      <Box component="main" className="mt-16 flex flex-1 flex-col" id="main-content">
        {/* Hero */}
        <Box
          component="section"
          className="flex w-full justify-center bg-bg-primary px-4 py-16 md:px-10 md:py-20"
          aria-labelledby="hero-heading"
        >
          <Stack spacing={8} className="w-full max-w-[1200px] items-center text-center">
            <Stack spacing={3} className="max-w-[800px] items-center">
              <Typography
                id="hero-heading"
                variant="h1"
                className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary md:text-5xl"
              >
                Build live data presentations
              </Typography>
              <Typography variant="body1" className="max-w-[600px] text-lg leading-relaxed text-text-secondary md:text-xl">
                Integrate live data sources directly into your slide decks. Bridge the gap between static presentation tools
                and complex BI dashboards.
              </Typography>
              <Stack direction="row" spacing={2} className="mt-2 w-full flex-col justify-center sm:w-auto sm:flex-row">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="filled" className="h-12 w-full px-8 text-base font-semibold shadow-md sm:w-auto">
                    Start building free
                  </Button>
                </Link>
                <Button variant="outlined" className="h-12 w-full border-border-default bg-bg-primary px-8 text-base font-semibold shadow-sm sm:w-auto">
                  Book a demo
                </Button>
              </Stack>
            </Stack>

            <Paper
              variant="outlined"
              className="mt-4 w-full max-w-[1000px] overflow-hidden rounded-md shadow-lg"
            >
              <Box className="flex h-8 items-center gap-2 border-b border-border-default bg-bg-secondary px-4" aria-hidden>
                <span className="size-3 rounded-full bg-border-default" />
                <span className="size-3 rounded-full bg-border-default" />
                <span className="size-3 rounded-full bg-border-default" />
              </Box>
              <Box className="flex min-h-[240px] flex-col justify-end gap-3 bg-bg-primary p-6 md:min-h-[320px] md:flex-row md:items-stretch">
                <Box className="flex flex-1 flex-col justify-end gap-2 rounded-sm bg-bg-secondary p-4">
                  <Box className="flex h-28 items-end gap-2">
                    {[36, 64, 48, 80, 44].map((px, i) => (
                      <Box
                        key={`b-${i}`}
                        className="w-6 rounded-t-sm bg-accent-primary/80"
                        style={{ height: `${px}px` }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" className="text-text-muted">
                    Live chart preview
                  </Typography>
                </Box>
                <Box className="flex flex-1 flex-col gap-3 rounded-sm bg-bg-secondary p-4">
                  <Box className="h-2 w-3/5 rounded-full bg-border-default" />
                  <Box className="h-2 w-4/5 rounded-full bg-border-default" />
                  <Box className="h-2 w-2/5 rounded-full bg-border-default" />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Box>

        {/* Features */}
        <Box
          component="section"
          id="features"
          className="w-full bg-bg-secondary py-16 md:py-20"
          aria-labelledby="features-heading"
        >
          <Stack spacing={6} className="mx-auto max-w-[1200px] px-4 md:px-10">
            <Stack spacing={2} className="items-center text-center md:items-start md:text-left">
              <Typography id="features-heading" variant="h2" className="text-3xl font-bold tracking-tight text-text-primary">
                Everything you need to present data
              </Typography>
              <Typography variant="body1" className="max-w-[600px] text-text-secondary">
                Stop copying and pasting screenshots. Connect your data once and always have the most up-to-date slides for
                your next meeting.
              </Typography>
            </Stack>
            <Grid columns={1} spacing={3} className="w-full md:grid-cols-3">
              <Paper
                variant="elevated"
                className="flex flex-col gap-4 rounded-md bg-bg-secondary p-6 shadow-md transition-shadow duration-[225ms] hover:shadow-lg"
              >
                <FeatureGlyph>
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 3L4 9v12h16V9l-8-6zm0 2.8l5 4V19H7v-9.2l5-4zM9 13h2v4H9v-4zm4 0h2v4h-2v-4z" />
                  </svg>
                </FeatureGlyph>
                <Stack spacing={1}>
                  <Typography variant="h6" className="font-bold text-text-primary">
                    Live data connections
                  </Typography>
                  <Typography variant="body2" className="leading-relaxed text-text-secondary">
                    Connect securely to databases or upload a CSV. Your charts update when the data changes.
                  </Typography>
                </Stack>
              </Paper>
              <Paper
                variant="elevated"
                className="flex flex-col gap-4 rounded-md bg-bg-secondary p-6 shadow-md transition-shadow duration-[225ms] hover:shadow-lg"
              >
                <FeatureGlyph>
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M3 18h18v2H3v-2zm2-2h3v-6H5v6zm5 0h3V8h-3v8zm5 0h3v-4h-3v4z" />
                  </svg>
                </FeatureGlyph>
                <Stack spacing={1}>
                  <Typography variant="h6" className="font-bold text-text-primary">
                    Drag-and-drop editor
                  </Typography>
                  <Typography variant="body2" className="leading-relaxed text-text-secondary">
                    A familiar canvas. Place content and map data fields to axes without leaving the presentation flow.
                  </Typography>
                </Stack>
              </Paper>
              <Paper
                variant="elevated"
                className="flex flex-col gap-4 rounded-md bg-bg-secondary p-6 shadow-md transition-shadow duration-[225ms] hover:shadow-lg"
              >
                <FeatureGlyph>
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
                  </svg>
                </FeatureGlyph>
                <Stack spacing={1}>
                  <Typography variant="h6" className="font-bold text-text-primary">
                    Presentation mode
                  </Typography>
                  <Typography variant="body2" className="leading-relaxed text-text-secondary">
                    Distraction-free fullscreen delivery with accurate numbers when it matters.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Stack>
        </Box>

        {/* Pricing teaser */}
        <Box component="section" id="pricing" className="w-full bg-bg-primary py-16 md:py-20">
          <Stack spacing={3} className="mx-auto max-w-[640px] items-center px-4 text-center">
            <Typography variant="h2" className="text-3xl font-bold text-text-primary">
              Simple pricing
            </Typography>
            <Typography variant="body1" className="text-text-secondary">
              Team plans and enterprise options are on the roadmap. Start free today—upgrade when you are ready.
            </Typography>
            <Link href="/register">
              <Button variant="filled" className="px-8 py-2 text-base font-semibold shadow-md">
                Get started
              </Button>
            </Link>
          </Stack>
        </Box>

        {/* Bottom CTA */}
        <Box component="section" className="w-full bg-bg-secondary py-16 md:py-24" aria-labelledby="cta-heading">
          <Stack spacing={4} className="mx-auto max-w-[800px] items-center px-4 text-center">
            <Typography id="cta-heading" variant="h2" className="text-3xl font-bold text-text-primary">
              Ready to elevate your presentations?
            </Typography>
            <Link href="/register">
              <Button variant="filled" className="h-12 px-8 text-base font-semibold shadow-md">
                Start building free
              </Button>
            </Link>
          </Stack>
        </Box>
      </Box>

      <Box
        component="footer"
        className="mt-auto w-full border-t border-border-default bg-bg-primary py-10"
        role="contentinfo"
      >
        <Box className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-10">
          <Box className="flex items-center gap-2 text-text-primary">
            <LogoMark className="!size-5" />
            <Typography variant="body2" className="font-bold">
              Interactive Presentation
            </Typography>
          </Box>
          <Box className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            <a href="#" className="no-underline transition-colors hover:text-accent-primary">
              Terms
            </a>
            <a href="#" className="no-underline transition-colors hover:text-accent-primary">
              Privacy
            </a>
            <a href="#" className="no-underline transition-colors hover:text-accent-primary">
              Contact
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
