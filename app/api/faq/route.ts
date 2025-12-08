import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const faqFilePath = path.join(process.cwd(), 'data', 'faq.json');

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'facilities' | 'policies' | 'other';
  order: number;
  isActive: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

// Get all FAQs or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly');

    let faqs: FAQ[] = JSON.parse(fs.readFileSync(faqFilePath, 'utf-8'));

    if (activeOnly === 'true') {
      faqs = faqs.filter((faq) => faq.isActive);
    }

    if (category && category !== 'all') {
      faqs = faqs.filter((faq) => faq.category === category);
    }

    // Sort by order
    faqs.sort((a, b) => a.order - b.order);

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error reading FAQs:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// Create new FAQ
export async function POST(request: NextRequest) {
  try {
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
