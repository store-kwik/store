'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Address = {
	id: string;
	type: 'BILLING' | 'SHIPPING';
	firstName: string;
	lastName: string;
	address1: string;
	address2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
};

export default function ProfilePage() {
	const { data: session, update } = useSession();
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
		type: 'SHIPPING',
		firstName: '',
		lastName: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		postalCode: '',
		country: '',
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (session?.user) {
			setName(session.user.name || '');
			setEmail(session.user.email || '');
			fetchAddresses();
		}
	}, [session]);

	const fetchAddresses = async () => {
		const response = await fetch('/api/user/addresses');
		if (response.ok) {
			const data = await response.json();
			setAddresses(data.addresses);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const response = await fetch('/api/user/profile', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email }),
		});

		if (response.ok) {
			await update({ name, email });
		} else {
			const data = await response.json();
			setError(
				data.error ||
					'An error occurred while updating your profile'
			);
		}
	};

	const handleAddAddress = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const response = await fetch('/api/user/addresses', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newAddress),
		});

		if (response.ok) {
			fetchAddresses();
			setNewAddress({
				type: 'SHIPPING',
				firstName: '',
				lastName: '',
				address1: '',
				address2: '',
				city: '',
				state: '',
				postalCode: '',
				country: '',
			});
		} else {
			const data = await response.json();
			setError(
				data.error || 'An error occurred while adding the address'
			);
		}
	};

	const handleDeleteAddress = async (id: string) => {
		const response = await fetch(`/api/user/addresses/${id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			fetchAddresses();
		} else {
			const data = await response.json();
			setError(
				data.error || 'An error occurred while deleting the address'
			);
		}
	};

	if (!session) {
		router.push('/login');
		return null;
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>User Profile</h1>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>
					Update Profile
				</h2>
				<form
					onSubmit={handleUpdateProfile}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='name'
							className='block mb-1'
						>
							Name
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='email'
							className='block mb-1'
						>
							Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<button
						type='submit'
						className='bg-blue-500 text-white px-4 py-2 rounded'
					>
						Update Profile
					</button>
				</form>
			</div>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>Addresses</h2>
				{addresses.map((address) => (
					<div
						key={address.id}
						className='border p-4 mb-4 rounded'
					>
						<p>
							{address.firstName} {address.lastName}
						</p>
						<p>{address.address1}</p>
						{address.address2 && <p>{address.address2}</p>}
						<p>
							{address.city}, {address.state}{' '}
							{address.postalCode}
						</p>
						<p>{address.country}</p>
						<button
							onClick={() =>
								handleDeleteAddress(address.id)
							}
							className='bg-red-500 text-white px-2 py-1 rounded mt-2'
						>
							Delete
						</button>
					</div>
				))}
			</div>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>
					Add New Address
				</h2>
				<form
					onSubmit={handleAddAddress}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='addressType'
							className='block mb-1'
						>
							Address Type
						</label>
						<select
							id='addressType'
							value={newAddress.type}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									type: e.target.value as
										| 'BILLING'
										| 'SHIPPING',
								})
							}
							className='w-full px-3 py-2 border rounded'
						>
							<option value='SHIPPING'>Shipping</option>
							<option value='BILLING'>Billing</option>
						</select>
					</div>
					<div>
						<label
							htmlFor='firstName'
							className='block mb-1'
						>
							First Name
						</label>
						<input
							type='text'
							id='firstName'
							value={newAddress.firstName}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									firstName: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='lastName'
							className='block mb-1'
						>
							Last Name
						</label>
						<input
							type='text'
							id='lastName'
							value={newAddress.lastName}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									lastName: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='address1'
							className='block mb-1'
						>
							Address Line 1
						</label>
						<input
							type='text'
							id='address1'
							value={newAddress.address1}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									address1: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='address2'
							className='block mb-1'
						>
							Address Line 2 (Optional)
						</label>
						<input
							type='text'
							id='address2'
							value={newAddress.address2}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									address2: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='city'
							className='block mb-1'
						>
							City
						</label>
						<input
							type='text'
							id='city'
							value={newAddress.city}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									city: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='state'
							className='block mb-1'
						>
							State
						</label>
						<input
							type='text'
							id='state'
							value={newAddress.state}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									state: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='postalCode'
							className='block mb-1'
						>
							Postal Code
						</label>
						<input
							type='text'
							id='postalCode'
							value={newAddress.postalCode}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									postalCode: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<div>
						<label
							htmlFor='country'
							className='block mb-1'
						>
							Country
						</label>
						<input
							type='text'
							id='country'
							value={newAddress.country}
							onChange={(e) =>
								setNewAddress({
									...newAddress,
									country: e.target.value,
								})
							}
							className='w-full px-3 py-2 border rounded'
						/>
					</div>
					<button
						type='submit'
						className='bg-green-500 text-white px-4 py-2 rounded'
					>
						Add Address
					</button>
				</form>
			</div>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>
					Link Accounts
				</h2>
				<div className='space-y-4'>
					<button
						onClick={() => signIn('google')}
						className='bg-red-500 text-white px-4 py-2 rounded w-full'
					>
						Link Google Account
					</button>
					<button
						onClick={() => signIn('facebook')}
						className='bg-blue-600 text-white px-4 py-2 rounded w-full'
					>
						Link Facebook Account
					</button>
					<button
						onClick={() => signIn('github')}
						className='bg-gray-800 text-white px-4 py-2 rounded w-full'
					>
						Link GitHub Account
					</button>
				</div>
			</div>

			{error && <div className='text-red-500 mt-4'>{error}</div>}
		</div>
	);
}
