import { useState, type FormEvent } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import { useWorkspace } from '../../state/WorkspaceContext';

export default function RestaurantSetupPage() {
	const { createRestaurant } = useWorkspace();
	const [name, setName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			await createRestaurant(name.trim());
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3, bgcolor: '#f5f5f1' }}>
			<Paper component="form" onSubmit={submit} elevation={0} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 }, border: '1px solid #e7e9e3' }}>
				<Box sx={{ width: 45, height: 45, display: 'grid', placeItems: 'center', bgcolor: '#e8f0eb', color: 'primary.main', borderRadius: '50%', mb: 2.5 }}>
					<RestaurantOutlined />
				</Box>
				<Typography component="h1" sx={{ fontFamily: 'Fraunces, serif', fontSize: 29, fontWeight: 650 }}>Cadastre seu restaurante</Typography>
				<Typography sx={{ color: 'text.secondary', mt: 1, mb: 3, fontSize: 13, lineHeight: 1.7 }}>
					Antes de começar, informe o nome da casa. Depois você poderá cadastrar mesas e itens do cardápio.
				</Typography>
				<TextField autoFocus fullWidth required label="Nome do restaurante" value={name} onChange={(event) => setName(event.target.value)} inputProps={{ maxLength: 255 }} sx={{ mb: 2.5 }} />
				<Button fullWidth type="submit" variant="contained" size="large" disabled={isSubmitting || !name.trim()} sx={{ py: 1.2 }}>
					{isSubmitting ? <CircularProgress size={21} color="inherit" /> : 'Continuar'}
				</Button>
			</Paper>
		</Box>
	);
}
