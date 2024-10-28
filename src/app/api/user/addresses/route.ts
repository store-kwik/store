import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 }
		);
	}

	try {
		const addresses = await prisma.address.findMany({
			where: { userId: session.user.id },
		});

		return NextResponse.json({ addresses });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 }
		);
	}

	const addressData = await req.json();

	try {
		const newAddress = await prisma.address.create({
			data: {
				...addressData,
				userId: session.user.id,
			},
		});

		return NextResponse.json({ address: newAddress });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
