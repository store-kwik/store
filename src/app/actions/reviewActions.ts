'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function createReview(data: {
	userId: string;
	productId: string;
	rating: number;
	comment?: string;
}) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	if (session.user.id !== data.userId) {
		throw new Error('Not authorized');
	}

	return prisma.review.create({
		data,
	});
}

export async function getReviews(productId: string, page = 1, limit = 10) {
	const skip = (page - 1) * limit;

	const [reviews, total] = await Promise.all([
		prisma.review.findMany({
			where: { productId },
			skip,
			take: limit,
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		}),
		prisma.review.count({ where: { productId } }),
	]);

	return {
		reviews,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			page,
			limit,
		},
	};
}

export async function updateReview(
	id: string,
	data: {
		rating?: number;
		comment?: string;
	}
) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	const review = await prisma.review.findUnique({ where: { id } });

	if (!review) {
		throw new Error('Review not found');
	}

	if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.review.update({
		where: { id },
		data,
	});
}

export async function deleteReview(id: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	const review = await prisma.review.findUnique({ where: { id } });

	if (!review) {
		throw new Error('Review not found');
	}

	if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.review.delete({
		where: { id },
	});
}
