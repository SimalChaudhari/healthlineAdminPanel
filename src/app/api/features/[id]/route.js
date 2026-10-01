import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Feature } from 'src/models/feature';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Feature not found', 404);

    await connectDB();
    const feature = await Feature.findById(params.id);
    if (!feature) return errorResponse('Feature not found', 404);

    return json({ feature: feature.toPublicJSON() });
  } catch (error) {
    console.error('Get feature error:', error);
    return errorResponse('Unable to load feature', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Feature not found', 404);

    const body = await request.json();
    await connectDB();

    const feature = await Feature.findById(params.id);
    if (!feature) return errorResponse('Feature not found', 404);

    if (body.key !== undefined) {
      const key = String(body.key || '')
        .trim()
        .replace(/\s+/g, '');
      if (!key) return errorResponse('Feature key is required', 400);
      const existing = await Feature.findOne({ key, _id: { $ne: feature._id } });
      if (existing) return errorResponse('A feature with this key already exists', 409);
      feature.key = key;
    }

    if (body.label !== undefined) {
      const label = String(body.label || '').trim();
      if (!label) return errorResponse('Feature label is required', 400);
      feature.label = label;
    }

    if (body.description !== undefined) feature.description = String(body.description || '').trim();
    if (body.icon !== undefined) feature.icon = String(body.icon || '').trim();
    if (body.color !== undefined) feature.color = String(body.color || '#0070E0').trim();
    if (body.route !== undefined) feature.route = String(body.route || '').trim();
    if (body.routeParams !== undefined) feature.routeParams = parseRouteParams(body.routeParams);
    if (body.aiKey !== undefined) feature.aiKey = String(body.aiKey || '').trim();
    if (body.showInHub !== undefined) {
      feature.showInHub = body.showInHub === true || body.showInHub === 'Yes';
    }
    if (body.status === 'Active' || body.status === 'Inactive') feature.status = body.status;

    await feature.save();
    return json({ feature: feature.toPublicJSON() });
  } catch (error) {
    console.error('Update feature error:', error);
    return errorResponse('Unable to update feature', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) return errorResponse('Feature not found', 404);

    await connectDB();
    const feature = await Feature.findByIdAndDelete(params.id);
    if (!feature) return errorResponse('Feature not found', 404);

    return json({ message: 'Feature deleted', id: params.id });
  } catch (error) {
    console.error('Delete feature error:', error);
    return errorResponse('Unable to delete feature', 500);
  }
}
