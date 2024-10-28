import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 }
		);
	}

	const { id } = params;

	try {
		const address = await prisma.address.findUnique({
			where: { id },
		});

		if (!address || address.userId !== session.user.id) {
			return NextResponse.json(
				{ error: 'Address not found or not authorized' },
				{ status: 404 }
			);
		}

		await prisma.address.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
