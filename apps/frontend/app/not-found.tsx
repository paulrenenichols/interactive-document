import { Box, Paper, Stack, Typography } from '@/lib/material-ui-shim';

export default function NotFound() {
  return (
    <Box component="main" sx={{ py: 4 }}>
      <Paper
        elevation={1}
        sx={{
          maxWidth: 480,
          mx: 'auto',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h3" component="h1">
            404
          </Typography>
          <Typography>This page could not be found.</Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
