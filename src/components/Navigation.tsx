'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export function Navigation() {
	const { data: session } = useSession();

	return (
		<nav className='bg-gray-800 text-white p-4'>
			<ul className='flex space-x-4'>
				<li>
					<Link href='/'>Home</Link>
				</li>
				<li>
					<Link href='/products'>Products</Link>
				</li>
				{session ? (
					<>
						<li>
							<Link href='/profile'>Profile</Link>
						</li>
						<li>
							<LogoutButton />
						</li>
					</>
				) : (
					<>
						<li>
							<Link href='/login'>Login</Link>
						</li>
						<li>
							<Link href='/register'>Register</Link>
						</li>
					</>
				)}
			</ul>
		</nav>
	);
}
