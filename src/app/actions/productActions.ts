'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function createProduct(data: {
	name: string;
	description: string;
	price: number;
	compareAtPrice?: number;
	sku: string;
	barcode?: string;
	inventory: number;
	weight?: number;
	length?: number;
	width?: number;
	height?: number;
	isDigital: boolean;
	digitalFileUrl?: string;
	categoryId: string;
}) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.product.create({
		data,
	});
}

export async function getProducts(
	page = 1,
	limit = 10,
	search?: string,
	categoryId?: string
) {
	const skip = (page - 1) * limit;

	const where: Prisma.ProductWhereInput = {
		...(search && {
			OR: [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
			],
		}),
		...(categoryId && { categoryId }),
	};

	const [products, total] = await Promise.all([
		prisma.product.findMany({
			where,
			skip,
			take: limit,
			include: {
				category: true,
				images: true,
			},
		}),
		prisma.product.count({ where }),
	]);

	return {
		products,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			page,
			limit,
		},
	};
}

export async function getProduct(id: string) {
	return prisma.product.findUnique({
		where: { id },
		include: {
			category: true,
			images: true,
			reviews: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	});
}

export async function updateProduct(
	id: string,
	data: {
		name?: string;
		description?: string;
		price?: number;
		compareAtPrice?: number;
		sku?: string;
		barcode?: string;
		inventory?: number;
		weight?: number;
		length?: number;
		width?: number;
		height?: number;
		isDigital?: boolean;
		digitalFileUrl?: string;
		categoryId?: string;
	}
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.product.update({
		where: { id },
		data,
	});
}

export async function deleteProduct(id: string) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.product.delete({
		where: { id },
	});
}
