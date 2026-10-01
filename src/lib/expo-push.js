import { User } from 'src/models/user';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100; // Expo accepts at most 100 messages per request

export function isExpoPushToken(value) {
  return /^Expo(nent)?PushToken\[.+\]$/.test(String(value || ''));
}

async function postChunk(messages) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  // Only needed when "Enhanced push security" is on in the Expo project.
  if (process.env.EXPO_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(messages),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(data?.data)) {
    throw new Error(data?.errors?.[0]?.message || `Expo push failed (${res.status})`);
  }
  return data.data;
}

/** Expo ticket error codes → what the admin should do about it. */
const PUSH_ERROR_HINTS = {
  InvalidCredentials:
    'Android push key missing: upload the Firebase FCM V1 service account key in Expo (eas credentials).',
  DeviceNotRegistered: 'App was uninstalled or notifications turned off on that phone.',
  MessageTooBig: 'Message is too long.',
  MessageRateExceeded: 'Too many messages to one phone — try again later.',
};

/**
 * Send one notification to every push token of the users matching `userFilter`.
 * Tokens Expo reports as DeviceNotRegistered are removed from users.
 */
export async function sendPushToUsers(userFilter, { title, body, data = {} }) {
  const users = await User.find(userFilter).select('+pushTokens');
  const tokens = [...new Set(users.flatMap((u) => u.pushTokens || []))].filter(isExpoPushToken);

  let sent = 0;
  let failed = 0;
  let error = '';
  const deadTokens = [];

  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    const messages = chunk.map((to) => ({
      to,
      title,
      body,
      data,
      sound: 'default',
      channelId: 'default',
    }));

    let tickets;
    try {
      // eslint-disable-next-line no-await-in-loop
      tickets = await postChunk(messages);
    } catch (chunkError) {
      console.error('Expo push chunk error:', chunkError);
      failed += chunk.length;
      error = error || chunkError.message;
      continue; // eslint-disable-line no-continue
    }

    for (let idx = 0; idx < tickets.length; idx += 1) {
      const ticket = tickets[idx];
      if (ticket.status === 'ok') {
        sent += 1;
      } else {
        failed += 1;
        const code = ticket.details?.error;
        if (code === 'DeviceNotRegistered') deadTokens.push(chunk[idx]);
        error = error || PUSH_ERROR_HINTS[code] || ticket.message || code || 'Unknown push error';
      }
    }
  }

  if (deadTokens.length) {
    await User.updateMany({}, { $pull: { pushTokens: { $in: deadTokens } } });
  }

  return { sent, failed, devices: tokens.length, error };
}

/** Send a saved Notification campaign to its audience and mark it Sent. */
export async function sendCampaign(notification) {
  const filter = { role: 'user', status: { $ne: 'Blocked' } };
  if (notification.audience && notification.audience !== 'All') filter.plan = notification.audience;

  const result = await sendPushToUsers(filter, {
    title: notification.title,
    body: notification.body,
    data: { notificationId: String(notification._id) },
  });

  notification.status = 'Sent';
  notification.sentAt = new Date();
  notification.sentCount = result.sent;
  notification.failedCount = result.failed;
  notification.lastError = result.error || '';
  await notification.save();

  return result;
}
