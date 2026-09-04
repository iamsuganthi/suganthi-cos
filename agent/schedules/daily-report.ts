import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";
import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack";

const SLACK_CONNECTOR = "slack/cos-suganthi";
const SLACK_USER_NAME = "Suganthi";

type SlackMember = {
  id?: string;
  deleted?: boolean;
  is_bot?: boolean;
  name?: string;
  real_name?: string;
  profile?: {
    display_name?: string;
    display_name_normalized?: string;
    real_name?: string;
  };
};

function memberMatchesName(member: SlackMember, needle: string) {
  if (!member.id || member.deleted || member.is_bot) return false;

  const names = [
    member.name,
    member.real_name,
    member.profile?.display_name,
    member.profile?.display_name_normalized,
    member.profile?.real_name,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  return names.some((name) => name === needle || name.startsWith(`${needle} `));
}

async function findSlackUserId(
  botToken: ReturnType<typeof connectSlackCredentials>["botToken"],
  displayName: string,
) {
  const needle = displayName.toLowerCase();
  let cursor: string | undefined;

  do {
    const response = await callSlackApi({
      botToken,
      operation: "users.list",
      body: cursor ? { cursor, limit: 200 } : { limit: 200 },
    });
    if (!response.ok) {
      throw new Error(`Slack users.list failed: ${String(response.error)}`);
    }

    const members = (response.members ?? []) as SlackMember[];
    const match = members.find((member) => memberMatchesName(member, needle));
    if (match?.id) return match.id;

    cursor = response.response_metadata?.next_cursor || undefined;
  } while (cursor);

  throw new Error(`Slack user "${displayName}" was not found`);
}

async function openDirectMessage(
  botToken: ReturnType<typeof connectSlackCredentials>["botToken"],
  userId: string,
) {
  const response = await callSlackApi({
    botToken,
    operation: "conversations.open",
    body: { users: userId },
  });
  if (!response.ok) {
    throw new Error(`Slack conversations.open failed: ${String(response.error)}`);
  }

  const channelId = (response.channel as { id?: string } | undefined)?.id;
  if (!channelId) {
    throw new Error("Slack conversations.open did not return a channel id");
  }
  return channelId;
}

export default defineSchedule({
  cron: "0 * * * *",
  async run({ to, waitUntil, appAuth }) {
    const { botToken } = connectSlackCredentials(SLACK_CONNECTOR);
    const userId = await findSlackUserId(botToken, SLACK_USER_NAME);
    const channelId = await openDirectMessage(botToken, userId);

    waitUntil(
      to(slack, { channelId }).send(
        [
          `You are already in Suganthi's Slack DM. Your reply is posted to Slack automatically.`,
          `Do not look for a Slack connection or try to send a message another way.`,
          `Mention <@${userId}> once at the top.`,
          ``,
          `1. Use the Notion connection to find Suganthi's To Do List (search for Suganthi's private To Do List). Read open and incomplete items, including due dates and status when available.`,
          `2. Use tell_jokes for one joke.`,
          `3. Reply with one Slack-formatted message and nothing else:`,
          ``,
          `*To-do*`,
          `Then group open items under short bold headings such as *Overdue*, *Today*, and *Upcoming*.`,
          `Use a compact bullet list, one item per line. Put the due date after the title when you have one.`,
          `Skip completed items. If there are no open items, say the list is clear.`,
          ``,
          `Then a divider, then *Joke*, then the joke.`,
          `No preamble, no tool commentary.`,
        ].join("\n"),
        { auth: appAuth },
      ),
    );
  },
});
