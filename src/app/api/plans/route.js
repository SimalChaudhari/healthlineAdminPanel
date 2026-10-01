import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Plan, ensureDefaultPlans, parsePriceAmount } from 'src/models/plan';
import { normalizeAiFeatures } from 'src/config/ai-features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function parseFeatures(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** Public catalog for APK (+ admin list). `?all=1` needs admin and includes Inactive. */
export async function GET(request) {
  try {
    await connectDB();
    await ensureDefaultPlans();

    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';

    if (wantAll) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
      const plans = await Plan.find().sort({ sortOrder: 1, createdAt: 1 });
      return json({ plans: plans.map((plan) => plan.toPublicJSON()) });
    }

    const plans = await Plan.find({ status: 'Active' }).sort({ sortOrder: 1, createdAt: 1 });
    return json({
      plans: plans.map((plan) => plan.toAppJSON()),
    });
  } catch (error) {
    console.error('List plans error:', error);
    return errorResponse('Unable to load plans', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const code = String(body.code || body.id || '')
      .trim()
      .replace(/\s+/g, '');
    const name = String(body.name || '').trim();

    if (!code) return errorResponse('Plan code is required (e.g. Free, Plus)', 400);
    if (!name) return errorResponse('Plan name is required', 400);

    await connectDB();

    const existing = await Plan.findOne({ code });
    if (existing) {
      return errorResponse('A plan with this code already exists', 409);
    }

    const plan = await Plan.create({
      code,
      name,
      tagline: String(body.tagline || '').trim(),
      priceMonthly: parsePriceAmount(body.priceMonthly) ?? 0,
      priceYearly: parsePriceAmount(body.priceYearly),
      features: parseFeatures(body.features),
      aiFeatures: normalizeAiFeatures(body.aiFeatures),
      highlight: Boolean(body.highlight),
      status: body.status === 'Inactive' ? 'Inactive' : 'Active',
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    });

    return json({ plan: plan.toPublicJSON() }, 201);
  } catch (error) {
    console.error('Create plan error:', error);
    return errorResponse('Unable to create plan', 500);
  }
}
