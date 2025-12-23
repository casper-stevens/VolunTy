import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const admin = adminClient();

    // Lookup user by calendar token
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id,full_name")
      .eq("calendar_token", token)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch user's assignments with event details
    const { data: assignments, error: assignErr } = await admin
      .from("shift_assignments")
      .select(
        "id,status,sub_shifts(id,role_name,start_time,end_time,events!sub_shifts_event_id_fkey(id,title,start_time,end_time,location))"
      )
      .eq("user_id", profile.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (assignErr) throw assignErr;

    // Build iCalendar format (RFC 5545)
    const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const events: string[] = [];

    (assignments ?? []).forEach((row: any) => {
      const sub = row.sub_shifts;
      const evt = sub?.events;

      if (!evt || !sub) return;

      const parseDateTime = (dateStr: string) => {
        if (!dateStr) return "";
        // Extract YYYY-MM-DDTHH:MM:SS and convert to ICS UTC format (20251223T140000Z)
        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!match) return "";
        return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}${match[6]}Z`;
      };

      const startTime = parseDateTime(sub.start_time || evt.start_time || "");
      const endTime = parseDateTime(sub.end_time || evt.end_time || "");

      if (!startTime || !endTime) return;

      const uid = `shift-${row.id}@volunty.local`;
      const title = `${evt.title} - ${sub.role_name}`;
      const description = `Role: ${sub.role_name}${evt.location ? `\nLocation: ${evt.location}` : ""}`;
      const location = evt.location || "";

      events.push(`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${escapeCalendarText(title)}
DESCRIPTION:${escapeCalendarText(description)}
LOCATION:${escapeCalendarText(location)}
STATUS:CONFIRMED
END:VEVENT`);
    });

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VolunTy//Calendar Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${escapeCalendarText(`${profile.full_name || "Volunteer"} Shifts`)}
X-WR-TIMEZONE:UTC
${events.join("\n")}
END:VCALENDAR`;

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${profile.full_name || "shifts"}.ics"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to generate calendar" }, { status: 500 });
  }
}

function escapeCalendarText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .substring(0, 1000); // Limit length
}
