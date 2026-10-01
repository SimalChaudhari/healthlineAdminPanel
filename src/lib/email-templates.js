/**
 * HealthLine transactional email templates.
 * Table layout + inline styles only — Gmail, Outlook and Apple Mail strip <style> and flexbox.
 */

const BRAND = {
  blue: '#0070E0',
  blueDark: '#0056B3',
  green: '#2ECC71',
  greenDark: '#1E9E55',
  ink: '#1A2233',
  muted: '#6B7385',
  line: '#E6EAF0',
  page: '#EEF3F8',
  soft: '#F4F8FD',
};

const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Hidden inbox preview line shown next to the subject. */
function preheader(text) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${escapeHtml(text)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>`;
}

function layout({ preview, accent = BRAND.blue, accentEnd = BRAND.green, icon, title, body }) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};-webkit-text-size-adjust:100%">
${preheader(preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.page}" style="background:${BRAND.page}">
  <tr>
    <td align="center" style="padding:32px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

        <!-- Header -->
        <tr>
          <td bgcolor="${accent}" style="background:${accent};background-image:linear-gradient(135deg,${accent} 0%,${accentEnd} 100%);border-radius:20px 20px 0 0;padding:28px 32px;text-align:center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="background:rgba(255,255,255,0.18);border-radius:14px;width:48px;height:48px;text-align:center;vertical-align:middle;font-size:26px;line-height:48px">🌿</td>
                <td style="padding-left:12px;text-align:left">
                  <div style="font-family:${FONT};font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:0.3px">HealthLine</div>
                  <div style="font-family:${FONT};font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:1.5px;text-transform:uppercase">Eat Smart • Live Better</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:0 0 20px 20px;box-shadow:0 12px 32px rgba(16,42,84,0.10)">
              <tr>
                <td style="padding:36px 32px 32px;text-align:center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                    <tr>
                      <td style="width:72px;height:72px;border-radius:36px;background:${BRAND.soft};border:1px solid ${BRAND.line};text-align:center;vertical-align:middle;font-size:34px;line-height:72px">${icon}</td>
                    </tr>
                  </table>
                  <h1 style="margin:20px 0 0;font-family:${FONT};font-size:24px;line-height:32px;font-weight:700;color:${BRAND.ink}">${escapeHtml(title)}</h1>
                  ${body}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 24px 8px;text-align:center;font-family:${FONT}">
            <div style="font-size:13px;color:${BRAND.muted};line-height:20px">
              Need help? Just reply to this email and our team will get back to you.
            </div>
            <div style="font-size:12px;color:#9AA3B2;line-height:18px;margin-top:12px">
              © ${year} HealthLine · Eat Smart • Live Better<br>
              This is an automated message about your HealthLine account.
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function paragraph(html, extra = '') {
  return `<p style="margin:12px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${BRAND.muted};${extra}">${html}</p>`;
}

function otpBoxes(otp) {
  const cells = String(otp)
    .split('')
    .map(
      (d) =>
        `<td style="padding:0 4px"><div style="width:46px;height:56px;line-height:56px;border-radius:12px;background:${BRAND.soft};border:2px solid ${BRAND.blue};font-family:${FONT};font-size:28px;font-weight:700;color:${BRAND.blue};text-align:center">${escapeHtml(d)}</div></td>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0"><tr>${cells}</tr></table>`;
}

function pill(text, color, bg) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto 0"><tr><td style="background:${bg};border-radius:999px;padding:8px 16px;font-family:${FONT};font-size:13px;font-weight:600;color:${color}">${text}</td></tr></table>`;
}

function noteBox({ icon, title, text, color, bg, border }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr><td style="background:${bg};border:1px solid ${border};border-radius:14px;padding:16px 18px;text-align:left">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:top;font-size:20px;line-height:22px;padding-right:12px">${icon}</td>
      <td style="font-family:${FONT}">
        <div style="font-size:14px;font-weight:700;color:${color};line-height:20px">${title}</div>
        <div style="font-size:13px;color:${BRAND.muted};line-height:20px;margin-top:2px">${text}</div>
      </td>
    </tr></table>
  </td></tr></table>`;
}

function divider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr><td style="border-top:1px solid ${BRAND.line};font-size:0;line-height:0">&nbsp;</td></tr></table>`;
}

export function renderPasswordResetOtpEmail({ name, otp, minutes }) {
  const who = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';

  return layout({
    preview: `Your password reset code is ${otp}. It expires in ${minutes} minutes.`,
    icon: '🔐',
    title: 'Reset your password',
    body: `
      ${paragraph(`${who}<br>We received a request to reset the password for your HealthLine account. Enter this code in the app to continue:`)}
      ${otpBoxes(otp)}
      ${pill(`⏱&nbsp; Expires in ${minutes} minutes`, BRAND.blueDark, '#E6F1FC')}
      ${noteBox({
        icon: '🛡️',
        title: 'Keep this code private',
        text: 'HealthLine staff will never ask for this code. Don’t share it with anyone.',
        color: '#8A5A00',
        bg: '#FFF8E6',
        border: '#FBE3A6',
      })}
      ${divider()}
      ${paragraph('Didn’t ask to reset your password? You can safely ignore this email — your password won’t change.', 'font-size:13px;line-height:20px;margin-top:20px')}
    `,
  });
}

function featureRow(icon, title, text) {
  return `<tr><td style="padding:10px 0">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="width:44px;height:44px;border-radius:12px;background:${BRAND.soft};text-align:center;vertical-align:middle;font-size:22px;line-height:44px">${icon}</td>
      <td style="padding-left:14px;font-family:${FONT};text-align:left">
        <div style="font-size:15px;font-weight:700;color:${BRAND.ink};line-height:20px">${title}</div>
        <div style="font-size:13px;color:${BRAND.muted};line-height:19px">${text}</div>
      </td>
    </tr></table>
  </td></tr>`;
}

export function renderWelcomeEmail({ name, email, createdByAdmin = false }) {
  const who = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
  const intro = createdByAdmin
    ? 'A HealthLine account has been created for you. Here are your account details:'
    : 'Your registration is complete and your account is ready. Here are your account details:';
  const signIn = createdByAdmin
    ? {
        icon: '🔑',
        title: 'Signing in for the first time?',
        text: 'Use the password your admin shared with you. You can set your own any time with “Forgot password” on the sign-in screen.',
      }
    : {
        icon: '✅',
        title: 'You’re all set',
        text: 'Open the HealthLine app and sign in with this email to pick up where you left off.',
      };

  return layout({
    preview: createdByAdmin
      ? 'Your HealthLine account has been created.'
      : 'Your HealthLine registration is complete — welcome aboard!',
    accent: BRAND.green,
    accentEnd: BRAND.blue,
    icon: '🎉',
    title: createdByAdmin ? 'Your account is ready' : 'Welcome to HealthLine!',
    body: `
      ${paragraph(`${who}<br>${intro}`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
        <tr><td style="background:${BRAND.soft};border:1px solid ${BRAND.line};border-radius:14px;padding:16px 18px;text-align:left;font-family:${FONT}">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.muted}">Account email</div>
          <div style="font-size:16px;font-weight:700;color:${BRAND.ink};margin-top:4px;word-break:break-all">${escapeHtml(email)}</div>
          <div style="margin-top:10px"><span style="display:inline-block;background:#E3F8EC;color:${BRAND.greenDark};border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700">● Active</span></div>
        </td></tr>
      </table>
      ${noteBox({ ...signIn, color: BRAND.greenDark, bg: '#EEFBF3', border: '#C8EFD8' })}
      ${divider()}
      <div style="margin-top:24px;font-family:${FONT};font-size:16px;font-weight:700;color:${BRAND.ink};text-align:left">What you can do with HealthLine</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px">
        ${featureRow('🥗', 'Log your meals', 'Search foods, scan barcodes or snap a photo.')}
        ${featureRow('💧', 'Track water & habits', 'Daily goals and gentle reminders.')}
        ${featureRow('📈', 'See your progress', 'Weight trends, streaks and weekly reports.')}
      </table>
      ${divider()}
      ${paragraph('Didn’t create this account? Reply to this email and we’ll look into it.', 'font-size:13px;line-height:20px;margin-top:20px')}
    `,
  });
}
