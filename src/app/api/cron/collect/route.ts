import { NextResponse } from 'next/server';
import { collectAndSaveSnapshot } from '@/lib/snapshots';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/collect - Daily metrics collection endpoint
 * 
 * Called by Vercel Cron once per day at 6:00 AM UTC.
 * Collects metrics from GitHub/PyPI and stores a daily snapshot.
 * 
 * Security: Verifies the request is from Vercel Cron via CRON_SECRET.
 */
export async function POST(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request - invalid or missing authorization');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[Cron] Starting daily metrics collection at ${new Date().toISOString()}`);
    
    const result = await collectAndSaveSnapshot();

    if (result.skipped) {
      console.log(`[Cron] Snapshot already exists for ${result.date} - skipped`);
      return NextResponse.json({
        success: true,
        message: `Snapshot already exists for ${result.date} - skipped`,
        date: result.date,
        skipped: true,
      });
    }

    console.log(`[Cron] Successfully created snapshot for ${result.date} (ID: ${result.snapshotId})`);
    
    return NextResponse.json({
      success: true,
      message: `Daily snapshot created for ${result.date}`,
      snapshotId: result.snapshotId,
      date: result.date,
      skipped: false,
    });
  } catch (error) {
    console.error('[Cron] Failed to collect metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to collect metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/collect - Health check for the cron endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/collect',
    method: 'POST',
    schedule: '0 6 * * * (daily at 6:00 AM UTC)',
    description: 'Collects SDK metrics and stores daily snapshot',
  });
}
