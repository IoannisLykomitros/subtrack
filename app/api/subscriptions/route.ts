import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabaseClient"; 

const prisma = new PrismaClient();

function calculateNextDate(startDate: Date, cycle: string): Date {
  const date = new Date(startDate);
  switch (cycle) {
    case "Weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "Quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "Biannually": 
      date.setMonth(date.getMonth() + 6);
      break;
    case "Yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "Monthly":
    default:
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date;
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, price, startDate, cycle, category } = body;

    if (!userId || !name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const nextDate = calculateNextDate(new Date(startDate), cycle);

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        price: parseFloat(price),
        startDate: new Date(startDate),
        nextPayment: nextDate,
        cycle,
        category,
      },
    });

    return NextResponse.json(newSubscription, { status: 201 });

  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: userId },
      orderBy: { nextPayment: 'asc' } 
    });

    return NextResponse.json(subs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.subscription.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, startDate, cycle, category } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const nextDate = calculateNextDate(new Date(startDate), cycle);

    const updatedSub = await prisma.subscription.update({
      where: { id: id },
      data: {
        name,
        price: parseFloat(price),
        startDate: new Date(startDate),
        nextPayment: nextDate,
        cycle,
        category,
      },
    });

    return NextResponse.json(updatedSub, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}