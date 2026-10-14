import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { AuthProvider } from './state/AuthContext';
import './styles-react.css';

const theme = createTheme({
	palette: {
		primary: { main: '#244b43', dark: '#18372f', light: '#e8f0eb' },
		secondary: { main: '#bd654a' },
		background: { default: '#f5f5f1', paper: '#fff' },
		text: { primary: '#202923', secondary: '#727a73' },
		success: { main: '#387456' },
		warning: { main: '#b8792c' },
		error: { main: '#ae4c45' },
	},
	typography: {
		fontFamily: '"DM Sans", sans-serif',
		button: { textTransform: 'none', fontWeight: 650 },
		h1: { fontFamily: '"Fraunces", serif' },
		h2: { fontFamily: '"Fraunces", serif' },
		h3: { fontFamily: '"Fraunces", serif' },
	},
	shape: { borderRadius: 5 },
	components: {
		MuiButton: { defaultProps: { disableElevation: true } },
		MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
	},
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<AuthProvider>
					<App />
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
);