import { prisma } from '../lib/prisma';

async function listInvoices(amount: number) {
	const data = await prisma.invoice.findMany({
		where: { amount },
		select: {
			amount: true,
			customer: {
				select: { name: true },
			},
		},
	});

	return data.map((invoice) => ({
		amount: invoice.amount,
		name: invoice.customer.name,
	}));
}

export async function GET(request: Request) {
	try {
		const amountParam = new URL(request.url).searchParams.get('amount');
		const parsedAmount = Number(amountParam);
		const amount = Number.isFinite(parsedAmount) ? parsedAmount : 666;

		return Response.json(await listInvoices(amount));
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
