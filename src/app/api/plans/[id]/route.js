import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Plan, parsePriceAmount } from 'src/models/plan';
import { normalizeAiFeatures } from 'src/config/ai-features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('Plan not found', 404);
    }

    await connectDB();
    const plan = await Plan.findById(params.id);
    if (!plan) return errorResponse('Plan not found', 404);

    return json({ plan: plan.toPublicJSON() });
  } catch (error) {
    console.error('Get plan error:', error);
    return errorResponse('Unable to load plan', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('Plan not found', 404);
    }

    const body = await request.json();
    await connectDB();

    const plan = await Plan.findById(params.id);
    if (!plan) return errorResponse('Plan not found', 404);

    if (body.code !== undefined) {
      const code = String(body.code || '')
        .trim()
        .replace(/\s+/g, '');
      if (!code) return errorResponse('Plan code is required', 400);
      const existing = await Plan.findOne({
        code,
        _id: { $ne: plan._id },
      });
      if (existing) return errorResponse('A plan with this code already exists', 409);
      plan.code = code;
    }

    if (body.name !== undefined) {
      const name = String(body.name || '').trim();
      if (!name) return errorResponse('Plan name is required', 400);
      plan.name = name;
    }

    if (body.tagline !== undefined) plan.tagline = String(body.tagline || '').trim();
    if (body.priceMonthly !== undefined) {
      plan.priceMonthly = parsePriceAmount(body.priceMonthly) ?? 0;
    }
    if (body.priceYearly !== undefined) {
      plan.priceYearly = parsePriceAmount(body.priceYearly);
    }
    if (body.features !== undefined) plan.features = parseFeatures(body.features);
    if (body.aiFeatures !== undefined) plan.aiFeatures = normalizeAiFeatures(body.aiFeatures);
    if (body.highlight !== undefined) plan.highlight = Boolean(body.highlight);
    if (body.status === 'Active' || body.status === 'Inactive') plan.status = body.status;
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
      plan.sortOrder = Number(body.sortOrder);
    }

    await plan.save();
    return json({ plan: plan.toPublicJSON() });
  } catch (error) {
    console.error('Update plan error:', error);
    return errorResponse('Unable to update plan', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('Plan not found', 404);
    }

    await connectDB();
    const plan = await Plan.findByIdAndDelete(params.id);
    if (!plan) return errorResponse('Plan not found', 404);

    return json({ message: 'Plan deleted', id: params.id });
  } catch (error) {
    console.error('Delete plan error:', error);
    return errorResponse('Unable to delete plan', 500);
  }
}
