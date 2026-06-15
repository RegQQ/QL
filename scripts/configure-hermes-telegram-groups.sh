#!/bin/zsh
set -euo pipefail

HERMES="/Users/hang/.hermes/hermes-agent/venv/bin/hermes"

"$HERMES" config set telegram.require_mention true
"$HERMES" config set telegram.guest_mode true
"$HERMES" config set telegram.exclusive_bot_mentions true
"$HERMES" config set telegram.observe_unmentioned_group_messages true
"$HERMES" config set display.tool_progress off
"$HERMES" config set display.platforms.telegram.tool_progress off
"$HERMES" config set display.platforms.telegram.cleanup_progress true
"$HERMES" config set display.busy_ack_enabled false
"$HERMES" config set display.interim_assistant_messages false
"$HERMES" config set display.platforms.telegram.interim_assistant_messages false
"$HERMES" config set display.long_running_notifications false
"$HERMES" config set display.platforms.telegram.long_running_notifications false
"$HERMES" config set display.busy_input_mode queue
"$HERMES" config set approvals.mode off

echo "Hermes Telegram group mode enabled."
echo "Clean chat mode enabled: final replies only, no tool previews, busy notices, or command approval prompts."
echo "Next: add the bot to a Telegram group, disable privacy in BotFather, then mention the bot in the group."
