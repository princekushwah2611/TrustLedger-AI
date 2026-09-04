const fs = require('fs');
const path = require('path');

const transactions = [
  {
    id: 101,
    date: "2026-08-01T09:15:00Z",
    amount: 15000,
    vendor: "AWS Cloud Services",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Monthly cloud infrastructure hosting"
  },
  {
    id: 102,
    date: "2026-08-02T11:30:00Z",
    amount: 4200,
    vendor: "Slack Technologies",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Team chat workspace subscription"
  },
  {
    id: 103,
    date: "2026-08-03T14:20:00Z",
    amount: 125000,
    vendor: "Razorpay Payroll",
    category: "Payroll",
    paymentMode: "Bank Transfer",
    description: "Monthly engineering team salaries"
  },
  {
    id: 104,
    date: "2026-08-05T16:45:00Z",
    amount: 18500,
    vendor: "WeWork Office Space",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Desk membership fee for August"
  },
  // ANOMALY 1 (Duplicate pair 1 of 2): Tx 105 & Tx 106
  {
    id: 105,
    date: "2026-08-06T10:00:00Z",
    amount: 24500,
    vendor: "Nova Traders",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Bulk office furniture order"
  },
  {
    id: 106,
    date: "2026-08-07T09:30:00Z",
    amount: 24500, // Duplicate amount & vendor within 24h
    vendor: "Nova Traders",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Office furniture invoice payment"
  },
  {
    id: 107,
    date: "2026-08-08T12:10:00Z",
    amount: 3200,
    vendor: "Uber for Business",
    category: "Travel",
    paymentMode: "Card",
    description: "Client meeting travel reimbursement"
  },
  {
    id: 108,
    date: "2026-08-09T15:00:00Z",
    amount: 8500,
    vendor: "Google Workspace",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Enterprise email and drive subscription"
  },
  {
    id: 109,
    date: "2026-08-10T11:15:00Z",
    amount: 45000,
    vendor: "DevStudio Labs",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "UI/UX design milestone payment"
  },
  {
    id: 110,
    date: "2026-08-11T17:30:00Z",
    amount: 1500,
    vendor: "Swiggy Corporate",
    category: "Miscellaneous",
    paymentMode: "UPI",
    description: "Team lunch catering"
  },
  {
    id: 111,
    date: "2026-08-12T10:05:00Z",
    amount: 28000,
    vendor: "MakeMyTrip Business",
    category: "Travel",
    paymentMode: "Card",
    description: "Flight tickets for tech conference"
  },
  // ANOMALY 2 (Threshold Evasion 1 of 2): Tx 112
  {
    id: 112,
    date: "2026-08-13T14:40:00Z",
    amount: 48500, // 3% under ₹50,000 threshold
    vendor: "Vanguard Supplies",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Office hardware equipment purchase"
  },
  {
    id: 113,
    date: "2026-08-14T09:50:00Z",
    amount: 6000,
    vendor: "Figma Inc",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Annual design license fee"
  },
  {
    id: 114,
    date: "2026-08-15T13:25:00Z",
    amount: 3500,
    vendor: "GitHub",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Organization team plan"
  },
  {
    id: 115,
    date: "2026-08-16T11:00:00Z",
    amount: 12000,
    vendor: "Airtel Business",
    category: "Software Subscription",
    paymentMode: "Bank Transfer",
    description: "Dedicated leased line internet"
  },
  {
    id: 116,
    date: "2026-08-17T16:15:00Z",
    amount: 9500,
    vendor: "Zoom Video Communications",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Enterprise webinar license"
  },
  {
    id: 117,
    date: "2026-08-18T10:45:00Z",
    amount: 22000,
    vendor: "BlueDart Express",
    category: "Vendor Payment",
    paymentMode: "UPI",
    description: "Monthly courier and shipping services"
  },
  // ANOMALY 3 (Duplicate pair 2 of 2): Tx 118 & Tx 119
  {
    id: 118,
    date: "2026-08-19T11:00:00Z",
    amount: 82000,
    vendor: "Apex Tech Solutions",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Server hardware setup fee"
  },
  {
    id: 119,
    date: "2026-08-20T15:20:00Z",
    amount: 82000, // Duplicate amount & vendor within 28h
    vendor: "Apex Tech Solutions",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Server hardware maintenance fee"
  },
  {
    id: 120,
    date: "2026-08-21T09:30:00Z",
    amount: 5400,
    vendor: "Notion Labs",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Team documentation workspace"
  },
  {
    id: 121,
    date: "2026-08-21T14:15:00Z",
    amount: 18000,
    vendor: "ClearTax Corporate",
    category: "Software Subscription",
    paymentMode: "Bank Transfer",
    description: "GST filing platform subscription"
  },
  // ANOMALY 4 (Unusual Vendor): Tx 122
  {
    id: 122,
    date: "2026-08-22T16:00:00Z",
    amount: 150000, // Large round number to unknown vendor
    vendor: "ShadowCorp Logistics",
    category: "Miscellaneous",
    paymentMode: "Crypto Wallet",
    description: "Expedited freight & advisory service"
  },
  {
    id: 123,
    date: "2026-08-22T17:45:00Z",
    amount: 4500,
    vendor: "Canva Pro",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Marketing brand asset subscription"
  },
  {
    id: 124,
    date: "2026-08-23T11:20:00Z",
    amount: 14000,
    vendor: "Taj Hotels",
    category: "Travel",
    paymentMode: "Card",
    description: "Executive lodging for investor visit"
  },
  {
    id: 125,
    date: "2026-08-24T10:10:00Z",
    amount: 25000,
    vendor: "Zoho Books",
    category: "Software Subscription",
    paymentMode: "Bank Transfer",
    description: "Annual accounting suite plan"
  },
  {
    id: 126,
    date: "2026-08-24T15:30:00Z",
    amount: 8900,
    vendor: "LinkedIn Talent Solutions",
    category: "Vendor Payment",
    paymentMode: "Card",
    description: "Recruiting candidate posting slots"
  },
  // ANOMALY 5 (Threshold Evasion 2 of 2): Tx 127
  {
    id: 127,
    date: "2026-08-25T11:45:00Z",
    amount: 49250, // 1.5% under ₹50,000 threshold
    vendor: "Zenith Consulting",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Advisory fee installment"
  },
  {
    id: 128,
    date: "2026-08-25T14:10:00Z",
    amount: 3800,
    vendor: "Postman API Platform",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "API workspace developer seats"
  },
  {
    id: 129,
    date: "2026-08-26T09:50:00Z",
    amount: 11500,
    vendor: "Staples Business Depot",
    category: "Miscellaneous",
    paymentMode: "UPI",
    description: "Stationery and printer toner supplies"
  },
  {
    id: 130,
    date: "2026-08-26T16:20:00Z",
    amount: 65000,
    vendor: "Dell Financial Services",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Developer laptop lease installment"
  },
  {
    id: 131,
    date: "2026-08-27T10:00:00Z",
    amount: 7200,
    vendor: "Datadog Cloud Monitoring",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Infrastructure APM & log analytics"
  },
  {
    id: 132,
    date: "2026-08-27T14:30:00Z",
    amount: 19000,
    vendor: "HubSpot Marketing",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "CRM and inbound marketing hub"
  },
  {
    id: 133,
    date: "2026-08-28T12:00:00Z",
    amount: 2800,
    vendor: "1Password Business",
    category: "Software Subscription",
    paymentMode: "Card",
    description: "Team password vault security"
  },
  // ANOMALY 6 (Timing Anomaly): Tx 134
  {
    id: 134,
    date: "2026-08-30T02:15:00Z", // 2:15 AM on a Sunday
    amount: 35000,
    vendor: "Nexus Digital",
    category: "Software Subscription",
    paymentMode: "Crypto Wallet",
    description: "Emergency server migration charge"
  },
  {
    id: 135,
    date: "2026-08-30T10:30:00Z",
    amount: 16500,
    vendor: "IndiGo Airlines",
    category: "Travel",
    paymentMode: "Card",
    description: "Sales pitch trip to Bengaluru"
  },
  // ANOMALY 7 & 8 (Structuring / Smurfing Pattern 1 & 2): Tx 136 & Tx 137
  {
    id: 136,
    date: "2026-08-28T10:00:00Z",
    amount: 28500, // Structured payment 1 to Horizon Media
    vendor: "Horizon Media Group",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Digital campaign phase 1 disbursement"
  },
  {
    id: 137,
    date: "2026-08-29T11:30:00Z",
    amount: 29000, // Structured payment 2 to Horizon Media (Combined > 1.5x threshold)
    vendor: "Horizon Media Group",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Digital campaign phase 2 disbursement"
  },
  {
    id: 138,
    date: "2026-08-30T14:15:00Z",
    amount: 27500, // Structured payment 3 to Horizon Media within 7 days
    vendor: "Horizon Media Group",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Digital campaign phase 3 disbursement"
  },
  {
    id: 139,
    date: "2026-08-31T16:30:00Z",
    amount: 2100,
    vendor: "Zomato Gold Corporate",
    category: "Miscellaneous",
    paymentMode: "UPI",
    description: "Friday evening team snacks"
  },
  {
    id: 140,
    date: "2026-08-31T18:00:00Z",
    amount: 50000,
    vendor: "HDFC Bank Facility",
    category: "Vendor Payment",
    paymentMode: "Bank Transfer",
    description: "Quarterly locker and credit facility charge"
  }
];

const targetPath = path.join(__dirname, '../data/mockTransactions.json');
fs.writeFileSync(targetPath, JSON.stringify(transactions, null, 2));
console.log(`Successfully generated ${transactions.length} mock transactions with smurfing anomalies in ${targetPath}`);
