import { Prisma, InvoiceStatus } from '@prisma/client';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  Revenue,
} from './definitions';
import { prisma } from './prisma';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    const data = await prisma.revenue.findMany({
      orderBy: { month: 'asc' },
    });

    return data as Revenue[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        customer: {
          select: { name: true, imageUrl: true, email: true },
        },
      },
    });

    return data.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.customer.name,
      image_url: invoice.customer.imageUrl,
      email: invoice.customer.email,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, paidInvoices, pendingInvoices] =
      await Promise.all([
        prisma.invoice.count(),
        prisma.customer.count(),
        prisma.invoice.aggregate({
          where: { status: InvoiceStatus.paid },
          _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
          where: { status: InvoiceStatus.pending },
          _sum: { amount: true },
        }),
      ]);

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices: formatCurrency(paidInvoices._sum.amount ?? 0),
      totalPendingInvoices: formatCurrency(pendingInvoices._sum.amount ?? 0),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;

  try {
    const invoices = await prisma.$queryRaw<InvoicesTable[]>(Prisma.sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.date::text AS date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${search} OR
        customers.email ILIKE ${search} OR
        invoices.amount::text ILIKE ${search} OR
        invoices.date::text ILIKE ${search} OR
        invoices.status::text ILIKE ${search}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `);

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  const search = `%${query}%`;

  try {
    const data = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${search} OR
        customers.email ILIKE ${search} OR
        invoices.amount::text ILIKE ${search} OR
        invoices.date::text ILIKE ${search} OR
        invoices.status::text ILIKE ${search}
    `);

    const totalPages = Math.ceil(Number(data[0]?.count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        amount: true,
        status: true,
      },
    });

    if (!invoice) {
      return undefined;
    }

    return {
      id: invoice.id,
      customer_id: invoice.customerId,
      amount: invoice.amount / 100,
      status: invoice.status,
    } as InvoiceForm;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return customers as CustomerField[];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  const search = `%${query}%`;

  try {
    const data = await prisma.$queryRaw<CustomersTableType[]>(Prisma.sql`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        COALESCE(SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END), 0) AS total_pending,
        COALESCE(SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END), 0) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${search} OR
        customers.email ILIKE ${search}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `);

    return data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending)),
      total_paid: formatCurrency(Number(customer.total_paid)),
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
