import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AWS SBG VJIT Event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aws-sbg-vjit";
const REST_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

const MOCK_EVENTS: Record<
  string,
  {
    title: string;
    tagline: string;
    category: string;
    status: string;
    dateStr: string;
    venue: string;
  }
> = {
  "cloud-jumpstart-2026": {
    title: "Cloud Jumpstart Hackathon",
    tagline: "Overnight cloud sprint to build and deploy serverless apps.",
    category: "hackathon",
    status: "upcoming",
    dateStr: "Saturday, Feb 18, 2026",
    venue: "VJIT Main Seminar Hall",
  },
  "practitioner-camp-2026": {
    title: "AWS Cloud Practitioner Camp",
    tagline: "Get certified in 4 weeks. Guided curriculum and peer study.",
    category: "workshop",
    status: "live",
    dateStr: "Every Saturday, Jan - Feb 2026",
    venue: "VJIT Central Tech Lab",
  },
  "serverless-workshop-2025": {
    title: "Serverless Workshop",
    tagline: "Learn Lambda, API Gateway, and DynamoDB by doing.",
    category: "workshop",
    status: "past",
    dateStr: "Dec 05, 2025",
    venue: "VJIT Lab 4, CSE Block",
  },
};

async function getEvent(slug: string) {
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "events" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
    });
    const data = await res.json();
    const doc = data?.[0]?.document;
    if (!doc) return null;
    const fields = doc.fields;

    // Parse Date
    const startAtStr = fields?.startAt?.timestampValue;
    let formattedDate = "TBA";
    if (startAtStr) {
      try {
        const d = new Date(startAtStr);
        formattedDate = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        formattedDate = "TBA";
      }
    }

    return {
      title: fields?.title?.stringValue || "",
      tagline: fields?.tagline?.stringValue || "",
      category: fields?.category?.stringValue || "event",
      status: fields?.status?.stringValue || "upcoming",
      dateStr: formattedDate,
      venue: fields?.venue?.stringValue || "VJIT Campus",
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch event details via REST:", err);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawEvent = await getEvent(slug);

  const event = rawEvent ||
    MOCK_EVENTS[slug] || {
      title: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      tagline: "Join AWS SBG VJIT to build in the cloud with people who ship.",
      category: "event",
      status: "upcoming",
      dateStr: "TBA",
      venue: "VJIT Campus",
    };

  const statusColors = {
    live: "#10b981",
    upcoming: "#ff9900",
    past: "#8b93a1",
  };
  const statusColor =
    statusColors[event.status as "live" | "upcoming" | "past"] || "#ff9900";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0b0f17 0%, #05070a 100%)",
        padding: "60px 80px",
        fontFamily: "sans-serif",
        color: "#fafaf7",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow highlight bar at the top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "6px",
          background: "linear-gradient(to right, #ff9900, #ff5500, #ff9900)",
        }}
      />

      {/* Decorative Technical Grid Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "30%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "45%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "60%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "75%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "90%",
          width: "1px",
          height: "100%",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: 0,
          width: "100%",
          height: "1px",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 0,
          width: "100%",
          height: "1px",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          width: "100%",
          height: "1px",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "80%",
          left: 0,
          width: "100%",
          height: "1px",
          background: "rgba(255, 153, 0, 0.04)",
        }}
      />

      {/* Top Header Row with Logo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              padding: "6px",
              background: "rgba(255, 153, 0, 0.08)",
              border: "1px solid rgba(255, 153, 0, 0.25)",
              borderRadius: "6px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff9900"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ff9900",
              }}
            >
              AWS Student Builder Group
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#8b93a1",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              VJIT Chapter • Hyderabad
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 153, 0, 0.08)",
            border: "1px solid rgba(255, 153, 0, 0.3)",
            borderRadius: "4px",
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ff9900",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {event.category}
        </div>
      </div>

      {/* Main Title & Tagline inside glassmorphic panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          background: "rgba(11, 15, 23, 0.65)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "35px",
          margin: "20px 0",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#ff9900",
          }}
        >
          Community Event
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.15,
            color: "#ffffff",
            maxWidth: "950px",
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#8b93a1",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {event.tagline}
        </div>
      </div>

      {/* Info strip (Date & Venue) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "20px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: "40px" }}>
          {/* Date */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                fontWeight: 700,
                color: "#8b93a1",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Date & Time
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                color: "#fafaf7",
              }}
            >
              {event.dateStr}
            </div>
          </div>

          {/* Venue */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                fontWeight: 700,
                color: "#8b93a1",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Venue
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                color: "#fafaf7",
              }}
            >
              {event.venue}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "4px",
            padding: "6px 14px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: statusColor,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              color: statusColor,
              letterSpacing: "0.05em",
            }}
          >
            {event.status}
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
