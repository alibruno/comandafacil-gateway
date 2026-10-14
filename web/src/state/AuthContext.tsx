import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react';

export interface AuthUser {
	name: string;
	email: string;
}

interface Credentials {
	email: string;
	password: string;
}

interface Registration extends Credentials {
	name: string;
}

interface AuthValue {
	user: AuthUser | null;
	token: string | null;
	isChecking: boolean;
	sessionError: string | null;
	signIn: (credentials: Credentials) => Promise<void>;
	signUp: (registration: Registration) => Promise<void>;
	signOut: () => void;
}

interface AuthResponse {
	accessToken: string;
	expiresIn: number;
	user: AuthUser;
}

const TOKEN_KEY = 'comandafacil.access-token';
const EXPIRY_KEY = 'comandafacil.access-token-expiry';
const AuthContext = createContext<AuthValue | null>(null);

async function getErrorMessage(response: Response): Promise<string> {
	const body = await response.json() as { message?: string; detail?: string; errors?: Record<string, string[]> };
	if (body.message) return body.message;
	if (body.detail) return body.detail;
	const firstValidationError = Object.values(body.errors ?? {}).flat()[0];
	return firstValidationError ?? `Não foi possível autenticar (HTTP ${response.status}).`;
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isChecking, setIsChecking] = useState(true);
	const [sessionError, setSessionError] = useState<string | null>(null);

	const clearSession = useCallback(() => {
		sessionStorage.removeItem(TOKEN_KEY);
		sessionStorage.removeItem(EXPIRY_KEY);
		setToken(null);
		setUser(null);
	}, []);

	useEffect(() => {
		const storedToken = sessionStorage.getItem(TOKEN_KEY);
		const expiresAt = Number(sessionStorage.getItem(EXPIRY_KEY));
		if (!storedToken || !expiresAt || expiresAt <= Date.now()) {
			clearSession();
			setIsChecking(false);
			return;
		}

		const controller = new AbortController();
		void fetch('/api/auth/me', {
			headers: { Authorization: `Bearer ${storedToken}` },
			signal: controller.signal,
		}).then(async (response) => {
			if (!response.ok) throw new Error(await getErrorMessage(response));
			const currentUser = await response.json() as AuthUser;
			setToken(storedToken);
			setUser(currentUser);
		}).catch(() => {
			if (!controller.signal.aborted) {
				clearSession();
				setSessionError('Não foi possível validar sua sessão. Entre novamente quando a conexão estiver disponível.');
			}
		}).finally(() => {
			if (!controller.signal.aborted) setIsChecking(false);
		});
		return () => controller.abort();
	}, [clearSession]);

	useEffect(() => {
		if (!token) return;
		const expiresAt = Number(sessionStorage.getItem(EXPIRY_KEY));
		const timeout = window.setTimeout(clearSession, Math.max(0, expiresAt - Date.now()));
		return () => window.clearTimeout(timeout);
	}, [clearSession, token]);

	const authenticate = useCallback(async (path: 'login' | 'register', body: Credentials | Registration) => {
		setSessionError(null);
		const response = await fetch(`/api/auth/${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (!response.ok) throw new Error(await getErrorMessage(response));
		const result = await response.json() as AuthResponse;
		if (!result.accessToken || !result.user?.email || !result.user.name || result.expiresIn <= 0) {
			throw new Error('O servidor retornou uma resposta de autenticação inválida.');
		}
		sessionStorage.setItem(TOKEN_KEY, result.accessToken);
		sessionStorage.setItem(EXPIRY_KEY, String(Date.now() + result.expiresIn * 1000));
		setToken(result.accessToken);
		setUser(result.user);
	}, []);

	const signIn = useCallback((credentials: Credentials) => authenticate('login', credentials), [authenticate]);
	const signUp = useCallback((registration: Registration) => authenticate('register', registration), [authenticate]);
	const value = useMemo(
		() => ({ user, token, isChecking, sessionError, signIn, signUp, signOut: clearSession }),
		[user, token, isChecking, sessionError, signIn, signUp, clearSession],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const value = useContext(AuthContext);
	if (!value) throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
	return value;
}
