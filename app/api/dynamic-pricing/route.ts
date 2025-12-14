import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Get all rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    let query = supabase.from('dynamic_pricing_rules').select('*');

    if (type) {
      query = query.eq('rule_type', type);
    }

    if (active === 'true') {
      query = query.eq('active', true);
    }

    query = query.order('priority', { ascending: false });

    const { data: rules, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch rules' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rules: rules || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

// POST - Create new rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const ruleData = {
      name: body.name,
      room_id: body.roomId || body.room_id || null,
      rule_type: body.type || body.rule_type,
      conditions: body.conditions || {},
      price_adjustment: body.priceAdjustment || body.price_adjustment,
      adjustment_type: body.adjustmentType || body.adjustment_type || 'percentage',
      priority: body.priority || 5,
      active: body.isActive !== undefined ? body.isActive : true
    };

    const { data: newRule, error } = await supabaseAdmin
      .from('dynamic_pricing_rules')
      .insert(ruleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: 'Failed to create rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: newRule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}

// PUT - Update rule
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });
    }

    const ruleUpdates: any = {};
    if (updates.name !== undefined) ruleUpdates.name = updates.name;
    if (updates.roomId !== undefined || updates.room_id !== undefined) {
      ruleUpdates.room_id = updates.room_id || updates.roomId;
    }
    if (updates.type !== undefined || updates.rule_type !== undefined) {
      ruleUpdates.rule_type = updates.rule_type || updates.type;
    }
    if (updates.conditions !== undefined) ruleUpdates.conditions = updates.conditions;
    if (updates.priceAdjustment !== undefined || updates.price_adjustment !== undefined) {
      ruleUpdates.price_adjustment = updates.price_adjustment || updates.priceAdjustment;
    }
    if (updates.adjustmentType !== undefined || updates.adjustment_type !== undefined) {
      ruleUpdates.adjustment_type = updates.adjustment_type || updates.adjustmentType;
    }
    if (updates.priority !== undefined) ruleUpdates.priority = updates.priority;
    if (updates.active !== undefined || updates.isActive !== undefined) {
      ruleUpdates.active = updates.active !== undefined ? updates.active : updates.isActive;
    }

    const { data: updatedRule, error } = await supabaseAdmin
      .from('dynamic_pricing_rules')
      .update(ruleUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: 'Failed to update rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: updatedRule });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update rule' },
      { status: 500 }
    )
  }
}

// DELETE - Remove rule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('dynamic_pricing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete rule' },
      { status: 500 }
    )
  }
}
