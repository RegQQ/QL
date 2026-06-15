# backtest 01



Callable strategy name: backtest 01



Use this strategy when the user asks Telegram/Hermes to backtest or test stocks with backtest 01.



Long-Only Equity Strategy

(Weekly Multi-Factor: Technical Trend + Fundamental Quality + Earnings Momentum)

For Bloomberg Backtest (BT) & BQL Implementation

Strategy Overview

Asset Class: Large-Cap & Mid-Cap Liquid Equities (Global / Regional Index Components)

Time Frame: Weekly Decision Bars (with Daily Confirmation)

Strategy Style: Trend + Quality + Earnings Revision Momentum

Direction: Long Only

Rebalance: Weekly

1. Universe & Liquidity Filter (First Pass)

Market capitalization > USD 5 billion

Average daily trading volume > 1,000,000 shares in the past 20 trading days

No penny stocks; price > $10

2. Fundamental Quality Filters (Must Satisfy ALL)

Trailing 12-month EPS > 0

YoY EPS Growth ≥ 15%

YoY Revenue Growth ≥ 10%

ROE (Return on Equity) ≥ 12%

Debt-to-Equity Ratio ≤ 0.8 (financial leverage control)

3. Earnings Momentum & Analyst Sentiment

Positive Earnings Surprise: Actual EPS ≥ Consensus Estimate in the latest quarter

Upward Consensus EPS Revision:

Consensus estimate revised up in the past 30 days

Number of upward revisions > downward revisions

Analyst Rating Bias: Net analyst rating ≥ “Buy” (Bloomberg consensus rating)

4. Technical Trend & Multi-Timeframe Confirmation

Weekly Conditions

Weekly close > 40-week moving average (long-term uptrend)

Weekly close > 13-week moving average (medium-term strength)

Weekly MACD line > signal line (bullish trend)

Weekly RSI between 40 and 65 (no extreme overbought)

Daily Confirmation (Intra-Week Filter)

Daily RSI > 50 (short-term positive momentum)

No bearish engulfing pattern on daily chart

5. Entry Rule

Enter long at the next weekly open

if all filters in Sections 1–4 are satisfied.

6. Position Sizing & Risk Management

Max single position size: 5% of NAV

Max total gross exposure: 60% of NAV

Initial stop loss: 2.0 × Weekly ATR(14) below entry price

Max 15 positions in the portfolio at any time

No pyramiding / adding to existing positions

7. Exit Rules (Any Trigger = Full Exit at Next Weekly Open)

Price hits initial ATR stop loss

Weekly close below 40-week moving average

Weekly MACD bearish crossover (line below signal)

Latest quarterly EPS turns negative

Consensus EPS estimate revised down significantly in 30 days

Weekly RSI > 75 (extreme overbought profit-taking)

8. Backtest Specifications for Bloomberg

Data period: At least 10 years

Execution: Next weekly open

Transaction cost: 0.10% per trade

Slippage: 0.05% per trade

Dividends: Reinvested

Survivorship bias: Adjusted

9. Performance Metrics Required

Total return & Annualized return

Sharpe Ratio

Max Drawdown

Win Rate

Profit Factor

Number of trades

Average holding period (weeks)

Annual turnover
