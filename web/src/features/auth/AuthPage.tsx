import { useEffect, useState, type FormEvent } from 'react';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

type AuthMode = 'login' | 'register' | null;

interface AuthPageProps {
	initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = null }: AuthPageProps) {
	const navigate = useNavigate();
	const { signIn, signUp, isChecking, token, sessionError } = useAuth();
	const [mode, setMode] = useState<AuthMode>(initialMode);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => setMode(initialMode), [initialMode]);
	useEffect(() => {
		if (!isChecking && token) navigate('/', { replace: true });
	}, [isChecking, navigate, token]);

	const changeMode = (next: Exclude<AuthMode, null>) => {
		setError('');
		setMode(next);
		navigate(next === 'register' ? '/cadastro' : '/login', { replace: true });
	};

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			if (mode === 'register') {
				await signUp({ name: name.trim(), email: email.trim(), password });
			} else {
				await signIn({ email: email.trim(), password });
			}
			navigate('/', { replace: true });
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Não foi possível concluir a autenticação.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, bgcolor: '#f5f5f1' }}>
			<Box sx={{ p: { xs: 3, sm: 5, lg: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: { xs: '40vh', md: '100vh' }, color: 'white', background: 'radial-gradient(ellipse at 82% 18%, rgba(189,101,74,.38), transparent 40%), linear-gradient(145deg, #18372f 0%, #244b43 58%, #315e4e 100%)' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ width: 42, height: 42, border: '1px solid rgba(255,255,255,.35)', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontSize: 25 }}>c</Box>
					<Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 650 }}>comanda<span style={{ color: '#e3a58c' }}>fácil</span></Typography>
				</Box>
				<Box sx={{ maxWidth: 570, py: { xs: 5, md: 0 } }}>
					<Typography sx={{ textTransform: 'uppercase', letterSpacing: 2.4, fontSize: 11, color: '#c5d7ca', fontWeight: 700, mb: 2 }}>Gestão simples, serviço memorável</Typography>
					<Typography component="h1" sx={{ fontFamily: 'Fraunces, serif', fontSize: { xs: 38, sm: 52, lg: 64 }, lineHeight: 1.04, letterSpacing: -1.4 }}>Sua casa cheia. Sua operação leve.</Typography>
					<Typography sx={{ mt: 2.5, maxWidth: 440, color: 'rgba(255,255,255,.76)', fontSize: 15, lineHeight: 1.8 }}>Acompanhe pedidos, organize o salão e cuide do cardápio em um só lugar — com acesso seguro para sua equipe.</Typography>
				</Box>
				<Typography sx={{ color: 'rgba(255,255,255,.56)', fontSize: 11 }}>COMANDA FÁCIL · OPERAÇÃO DO RESTAURANTE</Typography>
			</Box>
			<Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, sm: 5 } }}>
				<Paper elevation={0} sx={{ width: '100%', maxWidth: 430, p: { xs: 3, sm: 4 }, border: '1px solid #e7e9e3', borderRadius: 2 }}>
					<Box sx={{ width: 45, height: 45, display: 'grid', placeItems: 'center', bgcolor: '#e8f0eb', color: 'primary.main', borderRadius: '50%', mb: 2.5 }}>
						<RestaurantOutlined />
					</Box>
					<Typography component="h2" sx={{ fontFamily: 'Fraunces, serif', fontSize: 29, fontWeight: 650 }}>Bem-vindo à sua operação</Typography>
					<Typography sx={{ color: 'text.secondary', mt: 1, fontSize: 13, lineHeight: 1.7 }}>Entre na sua conta ou cadastre-se para acessar o painel do restaurante.</Typography>
					{sessionError && <Alert severity="warning" sx={{ mt: 2 }}>{sessionError}</Alert>}
					<Button fullWidth variant="contained" size="large" startIcon={<LockOutlined />} endIcon={<ArrowForwardRounded />} sx={{ mt: 3.5, py: 1.35 }} onClick={() => changeMode('login')}>Entrar na minha conta</Button>
					<Divider sx={{ my: 2.5, color: 'text.secondary', fontSize: 11 }}>OU</Divider>
					<Button fullWidth variant="outlined" size="large" sx={{ py: 1.25 }} onClick={() => changeMode('register')}>Criar uma conta</Button>
					<Typography sx={{ mt: 3, textAlign: 'center', fontSize: 11, color: 'text.secondary' }}>Seu acesso é protegido e válido por 8 horas.</Typography>
				</Paper>
			</Box>
			<Dialog open={mode !== null} onClose={() => { setError(''); setMode(null); navigate('/acesso', { replace: true }); }} fullWidth maxWidth="xs">
				<Box component="form" onSubmit={submit}>
					<DialogTitle sx={{ pb: 0.5, fontFamily: 'Fraunces, serif', fontSize: 25 }}>
						{mode === 'register' ? 'Crie sua conta' : 'Acesse sua conta'}
					</DialogTitle>
					<DialogContent sx={{ pt: '14px !important' }}>
						<Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2.5 }}>
							{mode === 'register' ? 'Cadastre seus dados para começar a usar o ComandaFácil.' : 'Informe seu e-mail e senha para continuar.'}
						</Typography>
						{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
						{mode === 'register' && <TextField autoFocus fullWidth required label="Nome" value={name} onChange={(event) => setName(event.target.value)} inputProps={{ minLength: 2, maxLength: 100 }} autoComplete="name" sx={{ mb: 2 }} />}
						<TextField autoFocus={mode === 'login'} fullWidth required type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" sx={{ mb: 2 }} />
						<TextField fullWidth required type="password" label="Senha" value={password} onChange={(event) => setPassword(event.target.value)} inputProps={{ minLength: mode === 'register' ? 8 : undefined, maxLength: 72 }} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} helperText={mode === 'register' ? 'Use pelo menos 8 caracteres.' : undefined} />
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3, display: 'block' }}>
						<Button fullWidth type="submit" variant="contained" size="large" disabled={isSubmitting || isChecking} sx={{ py: 1.2 }}>
							{isSubmitting ? <CircularProgress size={21} color="inherit" /> : mode === 'register' ? 'Criar conta' : 'Entrar'}
						</Button>
						<Typography sx={{ textAlign: 'center', fontSize: 12, color: 'text.secondary', mt: 2 }}>
							{mode === 'register' ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
							<Button size="small" onClick={() => changeMode(mode === 'register' ? 'login' : 'register')}>
								{mode === 'register' ? 'Entrar' : 'Cadastre-se'}
							</Button>
						</Typography>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	);
}
