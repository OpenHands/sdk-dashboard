import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sdks, metricsSnapshots } from '@/lib/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get('period') || '30', 10);
    const sdkRepo = searchParams.get('sdk'); // Optional: owner/repo format

    // Validate period
    const validPeriods = [7, 30, 90, 180, 365];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Valid values: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    let sdkId: number | undefined;

    // If sdk parameter is provided, look up the SDK
    if (sdkRepo) {
      const [owner, repo] = sdkRepo.split('/');
      if (owner && repo) {
        const sdk = await db
          .select()
          .from(sdks)
          .where(eq(sdks.githubRepo, `${owner}/${repo}`))
          .limit(1);
        
        if (sdk.length > 0) {
          sdkId = sdk[0].id;
        }
      }
    }

    // Build query
    let query = db
      .select()
      .from(metricsSnapshots)
      .where(gte(metricsSnapshots.date, startDate.toISOString().split('T')[0]))
      .orderBy(desc(metricsSnapshots.date));

    // Filter by SDK if provided
    if (sdkId) {
      query = query.where(
        and(
          eq(metricsSnapshots.sdkId, sdkId),
          gte(metricsSnapshots.date, startDate.toISOString().split('T')[0])
        )
      ) as typeof query;
    }

    const snapshots = await query;

    // Transform data for charts
    const starsData = snapshots.map((s) => ({
      date: s.date,
      value: s.githubStars,
    }));

    const forksData = snapshots.map((s) => ({
      date: s.date,
      value: s.githubForks,
    }));

    const pypiData = snapshots.map((s) => ({
      date: s.date,
      value: s.pypiDownloadsWeekly,
    }));

    return NextResponse.json({
      period,
      data: {
        githubStars: starsData,
        githubForks: forksData,
        pypiDownloads: pypiData,
      },
      snapshotCount: snapshots.length,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
