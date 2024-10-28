'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function createCategory(data: {
	name: string;
	description?: string;
	parentCategoryId?: string;
}) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.category.create({
		data,
	});
}

export async function getCategories(includeSubcategories = false) {
	const categories = await prisma.category.findMany({
		where: {
			parentCategoryId: includeSubcategories ? undefined : null,
		},
		include: includeSubcategories
			? {
					subCategories: true,
			  }
			: undefined,
	});

	return categories;
}

export async function getCategory(id: string) {
	return prisma.category.findUnique({
		where: { id },
		include: {
			subCategories: true,
			parentCategory: true,
		},
	});
}

export async function updateCategory(
	id: string,
	data: {
		name?: string;
		description?: string;
		parentCategoryId?: string | null;
	}
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.category.update({
		where: { id },
		data,
	});
}

export async function deleteCategory(id: string) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	// First, update all products in this category to have no category
	await prisma.product.updateMany({
		where: { categoryId: id },
		data: { categoryId: undefined },
	});

	// Then, delete the category
	return prisma.category.delete({
		where: { id },
	});
}
