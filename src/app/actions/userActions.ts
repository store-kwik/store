'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function createUser(data: {
	email: string;
	password: string;
	name?: string;
}) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	const hashedPassword = await hash(data.password, 12);
	return prisma.user.create({
		data: {
			...data,
			password: hashedPassword,
		},
	});
}

export async function getUsers(page = 1, limit = 10) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	const skip = (page - 1) * limit;

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			skip,
			take: limit,
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
			},
		}),
		prisma.user.count(),
	]);

	return {
		users,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			page,
			limit,
		},
	};
}

export async function getUser(id: string) {
	const session = await getServerSession(authOptions);
	if (session?.user?.id !== id && session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
		},
	});
}

export async function updateUser(
	id: string,
	data: {
		name?: string;
		email?: string;
		role?: 'ADMIN' | 'CUSTOMER';
	}
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.id !== id && session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.user.update({
		where: { id },
		data,
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
		},
	});
}

export async function deleteUser(id: string) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.user.delete({
		where: { id },
	});
}
