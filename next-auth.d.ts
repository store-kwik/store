import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
	interface Session {
		user: {
			access_token: string;
			email: string;
			role: string;
			id: string;
			name: string;
		} & DefaultSession;
	}
	interface User extends DefaultUser {
		id: string;
		email: string;
		role: string;
		token_type: string;
		expires_in: string;
		access_token: string;
		name: string;
	}
}
declare module 'next-auth' {
	interface JWT extends DefaultJWT {
		access_token: string;
		email: string;
		id: string;
		name: string;
	}
}
