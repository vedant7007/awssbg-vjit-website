import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

/*
 * Owner: Rishikesh
 * Status: production-ready
 *
 * Responsive email template using react-email.
 * The QR code is accepted as a base64 data URI (generated server-side by
 * generateTicketQrImage in src/lib/qr/ticket.ts). This avoids remote image
 * blocking common in corporate and privacy-focused email clients.
 *
 * No em dashes anywhere in the template output.
 * No placeholder data, stats, or lorem ipsum.
 */

export type EventTicketEmailProps = {
  /** Recipient display name, e.g. "Ananya". */
  memberName: string;
  /** Full event name, e.g. "Cloud Fundamentals Workshop". */
  eventTitle: string;
  /** Pre-formatted date + time string, e.g. "12 Jul 2026, 5:00 PM IST". */
  eventDate: string;
  /** Human-readable venue or "Online via AWS Chime". */
  venue: string;
  /** Signed ticket code produced by generateTicketCode. Shown as monospace text below the QR. */
  ticketCode: string;
  /**
   * Base64 data URI for the QR image, produced by generateTicketQrImage.
   * Use a data URI so the image renders in clients that block remote images.
   */
  qrDataUri: string;
  /** Absolute URL to the public event page. */
  eventUrl: string;
};

export const EventTicketEmail = ({
  memberName,
  eventTitle,
  eventDate,
  venue,
  ticketCode,
  qrDataUri,
  eventUrl,
}: EventTicketEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Your ticket for {eventTitle}</title>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .email-body { background-color: #0b0f17 !important; }
              .email-container { background-color: #131826 !important; border-color: #242c3d !important; }
              .text-primary { color: #fafaf7 !important; }
              .text-muted { color: #8b93a1 !important; }
              .text-soft { color: #cbd2de !important; }
              .divider { border-color: #242c3d !important; }
              .footer-cell { background-color: #131826 !important; border-color: #242c3d !important; }
              .qr-wrapper { background-color: #ffffff !important; }
            }
          `}
        </style>
      </Head>
      <Body
        className="email-body"
        style={{
          margin: 0,
          padding: "32px 12px",
          backgroundColor: "#fafaf7",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Container
          className="email-container"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e4e0d6",
            borderRadius: "4px",
            maxWidth: "480px",
            width: "100%",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Section
            style={{
              backgroundColor: "#161d27",
              padding: "24px 28px",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: "11px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#ff9900",
              }}
            >
              AWS SBG VJIT
            </Text>
            <Heading
              as="h1"
              style={{
                margin: "8px 0 0",
                fontSize: "22px",
                fontWeight: 700,
                color: "#fafaf7",
                lineHeight: "1.2",
              }}
            >
              Your ticket is confirmed
            </Heading>
          </Section>

          {/* Body content */}
          <Section style={{ padding: "28px 28px 0" }}>
            <Text
              className="text-primary"
              style={{
                margin: "0 0 6px",
                fontSize: "15px",
                color: "#161d27",
              }}
            >
              Hi {memberName},
            </Text>
            <Text
              className="text-muted"
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              You are registered for the event below. Present this QR code at
              the venue entrance during check-in.
            </Text>

            <Text
              className="text-primary"
              style={{
                margin: "0 0 4px",
                fontSize: "19px",
                fontWeight: 700,
                color: "#161d27",
                lineHeight: "1.3",
              }}
            >
              {eventTitle}
            </Text>

            <Section style={{ marginTop: "12px" }}>
              <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "6px 0",
                        verticalAlign: "top",
                        width: "72px",
                      }}
                    >
                      <Text
                        className="text-muted"
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                          color: "#6b7280",
                        }}
                      >
                        Date
                      </Text>
                    </td>
                    <td style={{ padding: "6px 0", verticalAlign: "top" }}>
                      <Text
                        className="text-soft"
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#2a3140",
                        }}
                      >
                        {eventDate}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "6px 0",
                        verticalAlign: "top",
                        width: "72px",
                      }}
                    >
                      <Text
                        className="text-muted"
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                          color: "#6b7280",
                        }}
                      >
                        Venue
                      </Text>
                    </td>
                    <td style={{ padding: "6px 0", verticalAlign: "top" }}>
                      <Text
                        className="text-soft"
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#2a3140",
                        }}
                      >
                        {venue}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </Section>

          {/* QR Code Section */}
          <Section style={{ padding: "28px", textAlign: "center" }}>
            <div
              className="qr-wrapper"
              style={{
                display: "inline-block",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e0d6",
                borderRadius: "4px",
                padding: "12px",
              }}
            >
              <Img
                src={qrDataUri}
                width="200"
                height="200"
                alt="Ticket QR code"
                style={{ display: "block", border: 0, outline: "none" }}
              />
            </div>
            <Text
              style={{
                margin: "10px 0 0",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "11px",
                color: "#6b7280",
                letterSpacing: "0.5px",
                wordBreak: "break-all",
              }}
            >
              {ticketCode}
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={{ padding: "0 28px 28px", textAlign: "center" }}>
            <Button
              href={eventUrl}
              style={{
                backgroundColor: "#ff9900",
                borderRadius: "4px",
                padding: "12px 28px",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "#161d27",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View event details
            </Button>
          </Section>

          <Hr
            className="divider"
            style={{
              borderColor: "#e4e0d6",
              margin: 0,
            }}
          />

          {/* Footer */}
          <Section
            className="footer-cell"
            style={{
              padding: "16px 28px",
              backgroundColor: "#ffffff",
            }}
          >
            <Text
              className="text-muted"
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              This email was sent because you registered for an event hosted by
              AWS Student Builder Group at VJIT, Hyderabad. If you did not
              register, you can safely ignore this message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

/**
 * Render the event ticket confirmation email as a self-contained HTML string.
 * Call this on the server, pass the result to resend.emails.send() as `html`.
 */
export async function renderEventTicketEmail(
  props: EventTicketEmailProps,
): Promise<string> {
  return await render(<EventTicketEmail {...props} />);
}
