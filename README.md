# PangoBot
# Version 0.1 (in development).

Open Source discord bot for showing useful information in general about Pangolin Exchange.

Shows PNG price in the bot personal status.

Using p! prefix for commands.


# Automatic Functions (Turnable on/off)
- Send welcome DM message when a member enter the server with useful information. (Links and Rules)
- Reflect Twitter/Github activity in sets chat room.


# Command List:

Server Commands:
- Help    (p!help)
  - Command List  (p!help cmd)
  - What's PNG    (p!help png)
  - Links    (p!help links) (Link to pangolin exchange, analytics, forum and official discord invite). Useful for using the bot in other discord servers.

- APY (Input Pool). Shows the current APY of PNG Staking Pool and how much each token of the pool costs.
  - p!apy AVAX/PNG

- Token check (Input Ticker/Token Name). Shows the current price for ticker/Token, Liquidity and 24h Volume
  - p!token PNG / p!token Pangolin

- Info check. Shows Exchange 24h Volume and total liquidity.
  - p!info

# Personal Commands:
- Alert (Input Ticker or Token Name/Price) (Set the bot to send you a DM if the price of a coin reach determined value). 
  - p!alert PNG 4.50 / p!alert Pangolin 4.50


# Future possible Commands:
- Command to input a wallet address to show info about all PGL pools of this wallet.
- Command to show PNG/PGL top wallet addresses.
- Current Governance proposals and % Votes (There's a way to query this?).
