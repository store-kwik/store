import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 }
		);
	}

	const { name, email } = await req.json();

	try {
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { name, email },
		});

		return NextResponse.json({ user: updatedUser });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
