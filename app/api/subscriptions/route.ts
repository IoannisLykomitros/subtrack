import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabaseClient"; 

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, price, startDate, cycle } = body;

    if (!userId || !name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const nextDate = new Date(startDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        price: parseFloat(price),
        startDate: new Date(startDate),
        nextPayment: nextDate,
        cycle,
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