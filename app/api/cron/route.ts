import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const upcomingSubs = await prisma.subscription.findMany({
      where: {
        nextPayment: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const emailPromises = upcomingSubs.map(async (sub) => {
      const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(sub.userId);

      if (error || !user || !user.email) {
        console.log(`Could not find user for sub ${sub.id}`);
        return null;
      }

      console.log(`Attempting to send email to: ${user.email}`);

      const result = await resend.emails.send({
        from: 'onboarding@resend.dev', 
        to: user.email, 
        subject: `Upcoming Payment: ${sub.name}`,
        html: `<p>Your payment of $${sub.price} is due soon.</p>`,
      });

      return result;
    });
    await Promise.all(emailPromises);

    return NextResponse.json({ 
      message: `Emails sent for ${upcomingSubs.length} subscriptions` 
    });

  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}