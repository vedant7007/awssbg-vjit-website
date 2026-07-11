import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AWS SBG VJIT Member Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aws-sbg-vjit";
const REST_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

const MOCK_LEADS: Record<
  string,
  {
    displayName: string;
    username: string;
    role: string;
    team: string | null;
    photoURL: string;
  }
> = {
  alexcarter: {
    displayName: "Alex Carter",
    username: "alexcarter",
    role: "President",
    team: "Core Committee",
    photoURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80",
  },
  jordansmith: {
    displayName: "Jordan Smith",
    username: "jordansmith",
    role: "Vice President",
    team: "Core Committee",
    photoURL:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80",
  },
  taylorreed: {
    displayName: "Taylor Reed",
    username: "taylorreed",
    role: "Tech Lead",
    team: "Technical Team",
    photoURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80",
  },
  morganhayes: {
    displayName: "Morgan Hayes",
    username: "morganhayes",
    role: "Design Lead",
    team: "Design Team",
    photoURL:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80",
  },
  caseybrooks: {
    displayName: "Casey Brooks",
    username: "caseybrooks",
    role: "Events Lead",
    team: "Events Team",
    photoURL:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&q=80",
  },
  rileygreen: {
    displayName: "Riley Green",
    username: "rileygreen",
    role: "Marketing Lead",
    team: "Marketing Team",
    photoURL:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80",
  },
};

async function getMember(username: string) {
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "members" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "username" },
              op: "EQUAL",
              value: { stringValue: username.toLowerCase() },
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
    return {
      displayName: fields?.displayName?.stringValue || "",
      username: fields?.username?.stringValue || "",
      role: fields?.role?.stringValue || "Member",
      team: fields?.team?.stringValue || null,
      photoURL: fields?.photoURL?.stringValue || null,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch member detail via REST:", err);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const rawMember = await getMember(username);

  const member = rawMember ||
    MOCK_LEADS[username.toLowerCase()] || {
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      username: username,
      role: "Member",
      team: "Cloud Builder",
      photoURL: null,
    };

  const nameInitials = (member.displayName as string)
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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

      {/* Left side info block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          flex: 1,
          marginRight: "40px",
          zIndex: 10,
        }}
      >
        {/* Organizer Branding */}
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

        {/* Member credentials inside a glassmorphic block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            background: "rgba(11, 15, 23, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "30px",
            margin: "20px 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#ff9900",
                marginBottom: "6px",
              }}
            >
              Member Profile
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {member.displayName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#ff9900",
                fontFamily: "monospace",
                marginTop: "6px",
                fontWeight: 600,
              }}
            >
              {"@" + member.username}
            </div>
          </div>

          {/* Badges row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
                letterSpacing: "0.05em",
              }}
            >
              {member.role === "core" ? "Core Committee" : member.role}
            </div>
            {member.team && (
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fafaf7",
                }}
              >
                {member.team}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer URL */}
        <div
          style={{
            display: "flex",
            fontSize: 14,
            color: "#8b93a1",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "16px",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {"awssbg-vjit.org/m/" + member.username}
        </div>
      </div>

      {/* Right side avatar container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {member.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoURL}
            alt={member.displayName}
            style={{
              width: "280px",
              height: "280px",
              borderRadius: "16px",
              border: "3px solid rgba(255, 153, 0, 0.3)",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "280px",
              height: "280px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #111622 0%, #1c2333 100%)",
              border: "3px solid rgba(255, 153, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "96px",
              fontWeight: 900,
              color: "#ff9900",
            }}
          >
            {nameInitials}
          </div>
        )}
      </div>
    </div>,
    { ...size },
  );
}
