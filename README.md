# CashIT

An application that allows treasurers and members in the Software Engineering (IT) student division to manage parts of the division's economy.
Key features include:

- 🔁 Tracking reimbursements to members
- 💼 Tracking the amount of meeting and teambuilding expenses provided to members
- 💰 Seeing the amount of money in the division's bank accounts
- 📤 Forwarding documents to economy systems (Visma Scanner or other email-supported systems)
- 📋 Creating name lists of people who have received things for free from the division

# Integrations

CashIT makes use of multiple external services to provide its functionality.

## GoCardless

Used to see balances of bank accounts without having to add users to internet banking services.

> [!NOTE]
> Due to policies set by banks, GoCardless rate limits each bank account to 4 daily requests for each access scope: account details, balances, and transaction history.

## Gotify

Used to send notifications to the division treasurer about new reimbursements, as well as forwarding of documents.
