import { createTheme } from "@mui/material/styles";
import { tokens, CHART_SERIES_COLORS } from "./tokens";

export { CHART_SERIES_COLORS };

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.colorPrimary,
      contrastText: "#ffffff",
    },
    secondary: {
      main: tokens.colorSecondary,
    },
    success: {
      main: tokens.colorSuccess,
    },
    warning: {
      main: tokens.colorWarning,
    },
    error: {
      main: tokens.colorDanger,
    },
    divider: tokens.colorBorder,
    background: {
      default: tokens.colorSurface,
      paper: tokens.colorPanel,
    },
    text: {
      primary: "#0d1526",
      secondary: tokens.colorSecondary,
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    fontWeightRegular: 400,
    fontWeightBold: 700,
    h1: { fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.3 },
    h6: { fontWeight: 700, fontSize: "1rem", lineHeight: 1.4 },
    body1: { fontSize: "0.875rem", lineHeight: 1.6 },
    body2: { fontSize: "0.75rem", lineHeight: 1.5 },
    caption: { fontSize: "0.6875rem", lineHeight: 1.4 },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"tnum" 1',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: tokens.colorChrome,
          color: "rgba(255,255,255,0.9)",
          minHeight: 48,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.colorChrome,
          color: "rgba(255,255,255,0.9)",
          borderRight: `1px solid ${tokens.colorBorder}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 4,
        },
        containedPrimary: {
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          borderColor: tokens.colorBorder,
        },
      },
    },
  },
});
