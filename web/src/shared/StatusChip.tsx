import { Chip } from '@mui/material';
import type { OrderStatus } from '../types';
import { statusLabels } from '../types';

const colors: Record<OrderStatus, { bg: string; color: string; dot: string }> = {
	cozinha: { bg: '#f8e8e4', color: '#a24c3e', dot: '#c45d4c' },
	preparo: { bg: '#f6eedc', color: '#8b6725', dot: '#b8792c' },
	pronto: { bg: '#e5f0e8', color: '#387456', dot: '#478563' },
	finalizado: { bg: '#eceeea', color: '#626b63', dot: '#818981' },
};

export default function StatusChip({ status }: { status: OrderStatus }) {
	const palette = colors[status];
	return <Chip size="small" label={statusLabels[status]} icon={<span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: palette.dot }} />} sx={{ bgcolor: palette.bg, color: palette.color, height: 25, fontSize: 11, fontWeight: 700, '& .MuiChip-icon': { ml: 1 } }} />;
}