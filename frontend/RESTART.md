# How to Fix "Internal Server Error" Issues

If you get internal server errors after making changes:

## Quick Fix (Recommended)
```bash
cd frontend
npm run dev:clean
```

This will:
1. Kill any running Next.js processes
2. Clean corrupted cache files
3. Start fresh on port 3004

## Manual Fix
```bash
cd frontend
pkill -9 -f "next dev"
rm -rf .next/.cache .next/static
PORT=3004 npm run dev
```

## Why This Happens
- Corrupted `.next` build cache
- Multiple dev servers running simultaneously
- File system permission issues

## Prevention
- Always use `npm run dev:clean` instead of `npm run dev` when restarting
- Let hot reload handle changes (don't restart unnecessarily)
- If errors persist, delete the entire `.next` folder
