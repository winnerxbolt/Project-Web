import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  order_index?: number;
  active?: boolean;
  created_at?: string;
}

// GET - Fetch all FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly');

    let query = supabase.from('faq').select('*');

    if (activeOnly === 'true') {
      query = query.eq('active', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.order('order_index', { ascending: true });

    const { data: faqs, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }

    return NextResponse.json(faqs || []);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const faqData = {
      question: body.question,
      answer: body.answer,
      category: body.category || 'other',
      order_index: body.order || body.order_index || 0,
      active: body.isActive !== undefined ? body.isActive : true
    };

    const { data: newFAQ, error } = await supabaseAdmin
      .from('faq')
      .insert(faqData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
    }

    return NextResponse.json(newFAQ, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID required' }, { status: 400 });
    }

    const faqUpdates: any = {};
    if (updates.question !== undefined) faqUpdates.question = updates.question;
    if (updates.answer !== undefined) faqUpdates.answer = updates.answer;
    if (updates.category !== undefined) faqUpdates.category = updates.category;
    if (updates.order !== undefined || updates.order_index !== undefined) {
      faqUpdates.order_index = updates.order_index !== undefined ? updates.order_index : updates.order;
    }
    if (updates.active !== undefined || updates.isActive !== undefined) {
      faqUpdates.active = updates.active !== undefined ? updates.active : updates.isActive;
    }

    const { data: updatedFAQ, error } = await supabaseAdmin
      .from('faq')
      .update(faqUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
    }

    return NextResponse.json(updatedFAQ);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

// DELETE - Remove FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
    const body = await request.json();
    const { question, answer, category, order, isActive } = body;

    const faqs: FAQ[] = JSON.parse(fs.readFileSync(faqFilePath, 'utf-8'));

    const newFAQ: FAQ = {
      id: `faq_${Date.now()}`,
      question,
      answer,
      category: category || 'other',
      order: order || faqs.length + 1,
      isActive: isActive !== undefined ? isActive : true,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    faqs.push(newFAQ);
    fs.writeFileSync(faqFilePath, JSON.stringify(faqs, null, 2));

    return NextResponse.json(newFAQ);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}

// Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, answer, category, order, isActive } = body;

    const faqs: FAQ[] = JSON.parse(fs.readFileSync(faqFilePath, 'utf-8'));
    const index = faqs.findIndex((faq) => faq.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    faqs[index] = {
      ...faqs[index],
      question: question || faqs[index].question,
      answer: answer || faqs[index].answer,
      category: category || faqs[index].category,
      order: order !== undefined ? order : faqs[index].order,
      isActive: isActive !== undefined ? isActive : faqs[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(faqFilePath, JSON.stringify(faqs, null, 2));
    return NextResponse.json(faqs[index]);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

// Increment views or feedback
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    const faqs: FAQ[] = JSON.parse(fs.readFileSync(faqFilePath, 'utf-8'));
    const index = faqs.findIndex((faq) => faq.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    if (action === 'view') {
      faqs[index].views++;
    } else if (action === 'helpful') {
      faqs[index].helpful++;
    } else if (action === 'notHelpful') {
      faqs[index].notHelpful++;
    }

    fs.writeFileSync(faqFilePath, JSON.stringify(faqs, null, 2));
    return NextResponse.json(faqs[index]);
  } catch (error) {
    console.error('Error updating FAQ stats:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

// Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let faqs: FAQ[] = JSON.parse(fs.readFileSync(faqFilePath, 'utf-8'));
    faqs = faqs.filter((faq) => faq.id !== id);

    fs.writeFileSync(faqFilePath, JSON.stringify(faqs, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
