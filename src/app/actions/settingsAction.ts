'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function updateSetting(
	key: string,
	value: string,
	type: 'GENERAL' | 'PAYMENT' | 'SHIPPING' | 'EMAIL' | 'SOCIAL'
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.settings.upsert({
		where: { key },
		update: { value, type },
		create: { key, value, type },
	});
}

export async function getSetting(key: string) {
	return prisma.settings.findUnique({
		where: { key },
	});
}

export async function getSettings(
	type?: 'GENERAL' | 'PAYMENT' | 'SHIPPING' | 'EMAIL' | 'SOCIAL'
) {
	const where = type ? { type } : {};
	return prisma.settings.findMany({ where });
}
