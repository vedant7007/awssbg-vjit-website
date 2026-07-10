/*
 * Owner: Rishikesh (polished design)
 * Status: production-ready premium template
 *
 * Renders a self-contained HTML string with inline styles, which
 * is the most portable format across email clients. No em dashes in output.
 */

export type EventTicketEmailProps = {
  memberName: string;
  eventTitle: string;
  eventDate: string; // preformatted, e.g. "12 Jul 2026, 5:00 PM"
  venue: string;
  ticketCode: string;
  coverImageUrl: string | null;
};

export function renderEventTicketEmail(props: EventTicketEmailProps): string {
  const {
    memberName,
    eventTitle,
    eventDate,
    venue,
    ticketCode,
    coverImageUrl,
  } = props;

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Your Ticket: ${escapeHtml(eventTitle)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e8eef3;">
            
            <!-- Cover Image or Header Banner -->
            ${
              coverImageUrl
                ? `
            <tr>
              <td style="padding: 0; line-height: 0;">
                <img src="${escapeAttr(coverImageUrl)}" alt="${escapeAttr(eventTitle)}" width="100%" style="width: 100%; max-height: 220px; object-fit: cover; border-bottom: 4px solid #ff9900; display: block;" />
              </td>
            </tr>
            `
                : `
            <tr>
              <td style="background-color: #1a202c; padding: 32px 24px; text-align: left; border-bottom: 4px solid #ff9900;">
                <span style="color: #ff9900; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">AWS Student Builder Group</span>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 8px 0 0 0; font-family: 'Helvetica Neue', Helvetica, sans-serif;">VJIT Hyderabad</h1>
              </td>
            </tr>
            `
            }

            <!-- Branded Accent strip when cover exists -->
            ${
              coverImageUrl
                ? `
            <tr>
              <td style="background-color: #1a202c; padding: 16px 24px; text-align: left;">
                <span style="color: #ff9900; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">AWS Student Builder Group</span>
              </td>
            </tr>
            `
                : ""
            }

            <!-- Main Content Card -->
            <tr>
              <td style="padding: 32px 24px;">
                <h2 style="color: #1a202c; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">Ticket Confirmed!</h2>
                <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi <strong>${escapeHtml(memberName)}</strong>,<br/>
                  Your registration is successful. Present the ticket code or scan the QR code below at the venue entrance.
                </p>

                <!-- Event Details Box -->
                <div style="background-color: #f7fafc; border-radius: 8px; border: 1px solid #edf2f7; padding: 20px; margin-bottom: 32px;">
                  <h3 style="color: #1a202c; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">${escapeHtml(eventTitle)}</h3>
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 8px; vertical-align: top; width: 24px;">
                        <span style="font-size: 16px;">📅</span>
                      </td>
                      <td style="padding-bottom: 8px; color: #4a5568; font-size: 14px; font-weight: 500;">
                        ${escapeHtml(eventDate)}
                      </td>
                    </tr>
                    <tr>
                      <td style="vertical-align: top; width: 24px;">
                        <span style="font-size: 16px;">📍</span>
                      </td>
                      <td style="color: #4a5568; font-size: 14px; font-weight: 500; line-height: 1.4;">
                        ${escapeHtml(venue)}
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Ticket QR / Code Section -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
                  <tr>
                    <td align="center">
                      <div style="display: inline-block; padding: 12px; background-color: #ffffff; border: 2px dashed #cbd5e0; border-radius: 8px; margin-bottom: 12px;">
                        <img src="cid:ticket-qr" width="180" height="180" alt="Ticket QR Code" style="display: block; border-radius: 4px;" />
                      </div>
                      <div style="margin-top: 4px;">
                        <span style="font-size: 11px; color: #718096; letter-spacing: 0.5px; text-transform: uppercase;">Ticket Reference</span>
                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 700; color: #2d3748; margin-top: 2px; letter-spacing: 1px;">
                          ${escapeHtml(ticketCode)}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #edf2f7;">
                <p style="color: #718096; font-size: 12px; margin: 0 0 6px 0; font-weight: 500;">
                  AWS Student Builder Group &bull; VJIT Hyderabad
                </p>
                <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                  This is an automated ticket confirmation. Please do not reply directly to this email.
                </p>
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
