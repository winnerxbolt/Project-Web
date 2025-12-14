import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const province = searchParams.get('province')
    const region = searchParams.get('region')

    let query = supabase.from('locations').select('*');

    if (province) {
      query = query.eq('province', province);
    }

    if (region) {
      query = query.eq('region', region);
    }

    query = query.order('name', { ascending: true });

    const { data: locations, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    return NextResponse.json(locations || []);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST - Create location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const locationData = {
      name: body.name,
      name_en: body.nameEn || body.name_en,
      province: body.province,
      region: body.region,
      country: body.country || 'Thailand',
      latitude: body.latitude,
      longitude: body.longitude,
      description: body.description || null
    };

    const { data: newLocation, error } = await supabaseAdmin
      .from('locations')
      .insert(locationData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

// PUT - Update location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    const locationUpdates: any = {};
    if (updates.name !== undefined) locationUpdates.name = updates.name;
    if (updates.nameEn !== undefined || updates.name_en !== undefined) {
      locationUpdates.name_en = updates.name_en || updates.nameEn;
    }
    if (updates.province !== undefined) locationUpdates.province = updates.province;
    if (updates.region !== undefined) locationUpdates.region = updates.region;
    if (updates.country !== undefined) locationUpdates.country = updates.country;
    if (updates.latitude !== undefined) locationUpdates.latitude = updates.latitude;
    if (updates.longitude !== undefined) locationUpdates.longitude = updates.longitude;
    if (updates.description !== undefined) locationUpdates.description = updates.description;

    const { data: updatedLocation, error } = await supabaseAdmin
      .from('locations')
      .update(locationUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return NextResponse.json(updatedLocation);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE - Remove location
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
