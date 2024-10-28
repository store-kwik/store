'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function addToCart(
	userId: string,
	productId: string,
	quantity: number
) {
	const session = await getServerSession(authOptions);
	if (!session?.user || session.user.id !== userId) {
		throw new Error('Not authorized');
	}

	let cart = await prisma.cart.findUnique({
		where: { userId },
		include: { items: true },
	});

	if (!cart) {
		cart = await prisma.cart.create({
			data: { userId },
			include: { items: true },
		});
	}

	const existingItem = cart.items.find(
		(item) => item.productId === productId
	);

	if (existingItem) {
		return prisma.cartItem.update({
			where: { id: existingItem.id },
			data: { quantity: existingItem.quantity + quantity },
		});
	} else {
		return prisma.cartItem.create({
			data: {
				cartId: cart.id,
				productId,
				quantity,
			},
		});
	}
}

export async function getCart(userId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user || session.user.id !== userId) {
		throw new Error('Not authorized');
	}

	return prisma.cart.findUnique({
		where: { userId },
		include: {
			items: {
				include: {
					product: true,
				},
			},
		},
	});
}

export async function updateCartItem(
	userId: string,
	cartItemId: string,
	quantity: number
) {
	const session = await getServerSession(authOptions);
	if (!session?.user || session.user.id !== userId) {
		throw new Error('Not authorized');
	}

	if (quantity <= 0) {
		return prisma.cartItem.delete({
			where: { id: cartItemId },
		});
	}

	return prisma.cartItem.update({
		where: { id: cartItemId },
		data: { quantity },
	});
}

export async function removeFromCart(userId: string, cartItemId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user || session.user.id !== userId) {
		throw new Error('Not authorized');
	}

	return prisma.cartItem.delete({
		where: { id: cartItemId },
	});
}

export async function clearCart(userId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user || session.user.id !== userId) {
		throw new Error('Not authorized');
	}

	const cart = await prisma.cart.findUnique({
		where: { userId },
	});

	if (cart) {
		await prisma.cartItem.deleteMany({
			where: { cartId: cart.id },
		});
	}

	return { success: true };
}
