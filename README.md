# Route and Vendor Management System

A Next.js + Supabase application for managing routes, vendors, items, bills, and generating summaries.

## Features

- **Billing System**: Create bills with multiple items and vendors
- **Data Management**: Manage routes, vendors, and items
- **Summary Reports**: View and download PDF summaries of all bills
- **Bulk Import**: Import data via CSV files for quick setup
- **Navigation**: Easy navigation between all sections

## Recent Fixes

✅ **Fixed favicon conflict** - Removed duplicate favicon.ico from src/app/
✅ **Cleared build cache** - Deleted .next folder for clean build
✅ **Updated navigation** - Added Import page to navigation bar
✅ **Fixed Link components** - Removed deprecated legacyBehavior usage

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- **Home** (`/`) - Dashboard overview
- **Billing** (`/billing`) - Create and manage bills
- **Items** (`/items`) - Manage inventory items
- **Vendors** (`/vendors`) - Manage vendor information
- **Routes** (`/routes`) - Manage delivery routes
- **Summary** (`/summary`) - View and download bill summaries
- **Import** (`/import`) - Bulk import data via CSV

## Database Tables

- `routes` - Delivery route information
- `vendors` - Vendor details
- `items` - Inventory items
- `bills` - Bill headers
- `bill_items` - Individual items in bills

## PDF Export

The summary page allows downloading:
- Individual bill PDFs
- Complete summary PDF with totals and item breakdowns

## Troubleshooting

If you encounter issues:
1. Clear browser cache (Ctrl+Shift+R)
2. Restart the development server
3. Check that your Supabase tables are properly set up

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
