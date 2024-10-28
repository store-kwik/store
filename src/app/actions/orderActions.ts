'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function createOrder(data: {
	userId: string;
	total: number;
	subTotal: number;
	tax: number;
	shippingCost: number;
	shippingAddressId: string;
	paymentMethod:
		| 'CREDIT_CARD'
		| 'PAYPAL'
		| 'BANK_TRANSFER'
		| 'CASH_ON_DELIVERY';
	orderItems: {
		productId: string;
		quantity: number;
		price: number;
	}[];
}) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	if (session.user.id !== data.userId && session.user.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.order.create({
		data: {
			...data,
			status: 'PENDING',
			paymentStatus: 'PENDING',
			orderItems: {
				create: data.orderItems,
			},
		},
		include: {
			orderItems: true,
		},
	});
}

export async function getOrders(page = 1, limit = 10, userId?: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	const skip = (page - 1) * limit;

	const where = {
		...(userId && session.user.role !== 'ADMIN'
			? { userId: session.user.id }
			: {}),
		...(userId && session.user.role === 'ADMIN' ? { userId } : {}),
	};

	const [orders, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip,
			take: limit,
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
				shippingAddress: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		}),
		prisma.order.count({ where }),
	]);

	return {
		orders,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			page,
			limit,
		},
	};
}

export async function getOrder(id: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		throw new Error('Not authenticated');
	}

	const order = await prisma.order.findUnique({
		where: { id },
		include: {
			orderItems: {
				include: {
					product: true,
				},
			},
			shippingAddress: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	if (!order) {
		throw new Error('Order not found');
	}

	if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return order;
}

export async function updateOrderStatus(
	id: string,
	status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.order.update({
		where: { id },
		data: { status },
	});
}

export async function updatePaymentStatus(
	id: string,
	paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== 'ADMIN') {
		throw new Error('Not authorized');
	}

	return prisma.order.update({
		where: { id },
		data: { paymentStatus },
	});
}
