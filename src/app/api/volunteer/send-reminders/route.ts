import { NextResponse } from "next/server";
import { sendShiftReminders } from "@/lib/notificationHelpers";

/**
 * API endpoint to trigger shift reminder notifications
 * Called by Supabase cron function
 * 
 * Usage: curl https://your-domain.com/api/volunteer/send-reminders?secret=YOUR_SECRET_KEY
 */
export async function GET(request: Request) {
  try {
    // Verify the secret key to prevent unauthorized calls
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secret");

    if (!secretKey || secretKey !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - invalid or missing secret key" },
        { status: 401 }
      );
    }

    // Send reminders
    const result = await sendShiftReminders();

    return NextResponse.json({
      success: true,
      sent: result.sent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in send-reminders endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
