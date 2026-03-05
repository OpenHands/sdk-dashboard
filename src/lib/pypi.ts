const PYPISTATS_API_BASE = 'https://pypistats.org/api';

interface PyPIStatsResponse {
  data: {
    last_day: number;
    last_week: number;
    last_month: number;
  };
  package: string;
  type: string;
}

export interface PyPIMetrics {
  weeklyDownloads: number;
  dailyDownloads: number;
  monthlyDownloads: number;
  package: string;
}

/**
 * Fetch download counts for a PyPI package
 */
export async function getPyPIDownloads(packageName: string): Promise<PyPIMetrics> {
  const url = `${PYPISTATS_API_BASE}/packages/${encodeURIComponent(packageName)}/recent`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (response.status === 404) {
    throw new Error(`PyPI package not found: ${packageName}`);
  }
  
  if (!response.ok) {
    throw new Error(`PyPI API error: ${response.status} ${response.statusText}`);
  }
  
  const data: PyPIStatsResponse = await response.json();
  
  return {
    weeklyDownloads: data.data.last_week,
    dailyDownloads: data.data.last_day,
    monthlyDownloads: data.data.last_month,
    package: data.package,
  };
}

/**
 * Fetch downloads, returns null if package doesn't exist
 */
export async function getPyPIDownloadsSafe(packageName: string): Promise<PyPIMetrics | null> {
  try {
    return await getPyPIDownloads(packageName);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}
