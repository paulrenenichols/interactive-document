import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@/lib/material-ui-shim';

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  return (
    <Box component="main" sx={{ py: 4 }}>
      <Paper
        elevation={1}
        sx={{
          maxWidth: 720,
          mx: 'auto',
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Interactive Presentation
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Landing placeholder. API URL: {apiUrl}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Link href="/login">
              <Button variant="filled">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="outlined">Create account</Button>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
