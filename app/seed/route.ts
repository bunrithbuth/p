import bcrypt from 'bcrypt';
import { InvoiceStatus } from '@prisma/client';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { prisma } from '../lib/prisma';

async function seedUsers() {
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: hashedPassword,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
        },
      });
    }),
  );

  return insertedUsers;
}

async function seedCustomers() {
  const insertedCustomers = await Promise.all(
    customers.map((customer) =>
      prisma.customer.upsert({
        where: { id: customer.id },
        update: {
          name: customer.name,
          email: customer.email,
          imageUrl: customer.image_url,
        },
        create: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          imageUrl: customer.image_url,
        },
      }),
    ),
  );

  return insertedCustomers;
}

async function seedInvoices() {
  await prisma.invoice.deleteMany();

  const insertedInvoices = await prisma.invoice.createMany({
    data: invoices.map((invoice) => ({
      customerId: invoice.customer_id,
      amount: invoice.amount,
      status: invoice.status as InvoiceStatus,
      date: new Date(invoice.date),
    })),
  });

  return insertedInvoices;
}

async function seedRevenue() {
  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      prisma.revenue.upsert({
        where: { month: rev.month },
        update: { revenue: rev.revenue },
        create: {
          month: rev.month,
          revenue: rev.revenue,
        },
      }),
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
