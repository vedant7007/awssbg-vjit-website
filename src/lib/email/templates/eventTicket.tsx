/*
 * Owner: Rishikesh
 * Status: skeleton (renders a real, sendable ticket email today)
 * Acceptance criteria:
 *   - Convert to @react-email/components for richer, testable markup if desired.
 *   - Include the event cover image and a branded header.
 *   - Embed the QR as an inline attachment (cid:) instead of a remote image so
 *     it renders in clients that block remote images.
 * Reference: lib/email/resend.ts for the send path.
 *
 * For now this returns a self-contained HTML string with inline styles, which
 * is the most portable format across email clients. No em dashes in output.
 */

export type EventTicketEmailProps = {
  memberName: string;
  eventTitle: string;
  eventDate: string; // preformatted, e.g. "12 Jul 2026, 5:00 PM"
  venue: string;
  ticketCode: string;
  qrImageUrl: string; // absolute URL to a rendered QR (see /api/registration/[id]/qr)
};

export function renderEventTicketEmail(props: EventTicketEmailProps): string {
  const { memberName, eventTitle, eventDate, venue, ticketCode, qrImageUrl } =
    props;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#fafaf7;font-family:Arial,Helvetica,sans-serif;color:#161d27;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4e0d6;border-radius:4px;overflow:hidden;">
            <tr>
              <td style="background:#161d27;padding:20px 24px;">
                <span style="color:#ff9900;font-size:12px;letter-spacing:1px;text-transform:uppercase;">AWS SBG VJIT</span>
                <div style="color:#fafaf7;font-size:20px;font-weight:700;margin-top:6px;">Your ticket is confirmed</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 4px;">Hi ${escapeHtml(memberName)},</p>
                <p style="margin:0 0 20px;color:#6b7280;">You are registered for the event below. Show this QR at check-in.</p>
                <div style="font-size:18px;font-weight:700;">${escapeHtml(eventTitle)}</div>
                <div style="margin-top:8px;color:#2a3140;">${escapeHtml(eventDate)}</div>
                <div style="color:#2a3140;">${escapeHtml(venue)}</div>
                <div style="text-align:center;margin:24px 0;">
                  <img src="${escapeAttr(qrImageUrl)}" width="180" height="180" alt="Ticket QR code" style="border:1px solid #e4e0d6;border-radius:4px;" />
                  <div style="margin-top:8px;font-family:monospace;font-size:12px;color:#6b7280;">${escapeHtml(ticketCode)}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #e4e0d6;color:#6b7280;font-size:12px;">
                AWS SBG at VJIT, Hyderabad
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
