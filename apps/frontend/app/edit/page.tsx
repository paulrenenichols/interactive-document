'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@/lib/material-ui-shim';
import { useDecks, useCreateDeck, type Deck } from '@/lib/queries';

export default function EditPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useDecks();
  const createDeck = useCreateDeck({
    onSuccess: (data) => {
      router.push(`/edit/${data.id}`);
    },
  });

  const forbidden =
    isError &&
    error instanceof Error &&
    (error.message.includes('no edit access') || error.message.includes('403'));

  if (forbidden) {
    return (
      <Box component="main" sx={{ py: 4 }}>
        <Paper
          elevation={1}
          sx={{
            maxWidth: 480,
            mx: 'auto',
            p: 3,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              No edit access
            </Typography>
            <Typography>
              You don&apos;t have permission to edit this content.
            </Typography>
            <Typography variant="body2">
              <MuiLink component={Link} href="/">
                Go home
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box component="main" sx={{ py: 4 }}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  const decks: Deck[] = data?.decks ?? [];

  return (
    <Box component="main" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Edit
        </Typography>

        <Paper
          elevation={1}
          sx={{
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">
              New document
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                type="button"
                onClick={() => createDeck.mutate()}
                disabled={createDeck.isPending}
                variant="filled"
              >
                {createDeck.isPending ? 'Creating…' : 'Create deck'}
              </Button>
              {createDeck.isError && (
                <Alert severity="error">
                  {createDeck.error?.message}
                </Alert>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={1}>
          <Typography variant="h6" component="h2">
            Your decks
          </Typography>
          {decks.length === 0 ? (
            <Typography>No decks yet.</Typography>
          ) : (
            <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', pl: 0 }}>
              {decks.map((d) => (
                <li key={d.id}>
                  <MuiLink component={Link} href={`/edit/${d.id}`}>
                    Deck {d.id.slice(0, 8)}…
                  </MuiLink>
                  {' — '}
                  <MuiLink component={Link} href={`/view/${d.id}`}>
                    View
                  </MuiLink>
                </li>
              ))}
            </Stack>
          )}
        </Stack>

        <Typography variant="body2">
          <MuiLink component={Link} href="/">
            Home
          </MuiLink>
        </Typography>
      </Stack>
    </Box>
  );
}
