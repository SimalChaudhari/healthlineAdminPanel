import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Feature, ensureDefaultFeatures } from 'src/models/feature';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function parseRouteParams(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

/** Public hub/catalog; `?all=1` admin full list; `?ai=1` AI tools only. */
export async function GET(request) {
  try {
    await connectDB();
    await ensureDefaultFeatures();

    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';
    const aiOnly = searchParams.get('ai') === '1';

    if (wantAll) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
      const features = await Feature.find().sort({ createdAt: 1, _id: 1 });
      return json({ features: features.map((f) => f.toPublicJSON()) });
    }

    const filter = {};
    if (aiOnly) {
      filter.status = 'Active';
      filter.aiKey = { $ne: '' };
    }

    const features = await Feature.find(filter).sort({ createdAt: 1, _id: 1 });

    if (aiOnly) {
      return json({
        features: features.map((f) => ({
          value: f.aiKey,
          label: f.label,
          key: f.key,
          icon: f.icon || '',
          color: f.color || '#0070E0',
        })),
      });
    }

    // Full catalog (incl. Inactive) so APK can hide hub tiles and block screens.
    return json({
      features: features.map((f) => f.toAppJSON()),
    });
  } catch (error) {
    console.error('List features error:', error);
    return errorResponse('Unable to load features', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const key = String(body.key || '')
      .trim()
      .replace(/\s+/g, '');
    const label = String(body.label || '').trim();

    if (!key) return errorResponse('Feature key is required', 400);
    if (!label) return errorResponse('Feature label is required', 400);

    await connectDB();

    const existing = await Feature.findOne({ key });
    if (existing) return errorResponse('A feature with this key already exists', 409);

    const feature = await Feature.create({
      key,
      label,
      description: String(body.description || '').trim(),
      icon: String(body.icon || '').trim(),
      color: String(body.color || '#0070E0').trim(),
      route: String(body.route || '').trim(),
      routeParams: parseRouteParams(body.routeParams),
      aiKey: String(body.aiKey || '').trim(),
      showInHub: body.showInHub !== false && body.showInHub !== 'No',
      status: body.status === 'Inactive' ? 'Inactive' : 'Active',
    });

    return json({ feature: feature.toPublicJSON() }, 201);
  } catch (error) {
    console.error('Create feature error:', error);
    return errorResponse('Unable to create feature', 500);
  }
}
