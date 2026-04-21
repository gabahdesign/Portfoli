import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import React from 'react';
import ReactPDF, { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Note: Registering fonts for better aesthetics
// Using public URLs for fonts is more reliable in PDF generation environments
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyAZ9hiA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 400,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  item: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111111',
  },
  itemDate: {
    fontSize: 10,
    color: '#999999',
  },
  itemPlace: {
    fontSize: 11,
    color: '#843aea', // Accent color
    fontWeight: 700,
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.5,
  },
});

const CVDocument = ({ data, locale, about }: any) => (
  <Document title={`CV - ${about?.name || 'Marc'}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{about?.name || 'Marc'}</Text>
        <Text style={styles.title}>{about?.tagline?.[locale] || about?.tagline?.['ca'] || ''}</Text>
      </View>

      {data.map((section: any) => {
        const content = section.content;
        let items: any[] = [];
        
        if (Array.isArray(content)) {
          items = content;
        } else if (content && typeof content === 'object') {
          items = content[locale] || content['ca'] || content['es'] || content['en'] || [];
        }

        if (items.length === 0) return null;

        return (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.title?.[locale] || section.title?.['ca'] || section.type}
            </Text>
            {items.map((item: any, i: number) => (
              <View key={i} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title || item.name}</Text>
                  <Text style={styles.itemDate}>
                    {item.date || `${item.date_start}${item.date_end ? ` - ${item.date_end}` : ' - Present'}`}
                  </Text>
                </View>
                {(item.place || item.subtitle || item.level) && (
                  <Text style={styles.itemPlace}>{item.place || item.subtitle || item.level}</Text>
                )}
                {item.description && (
                  <Text style={styles.itemDescription}>
                    {item.description.replace(/<[^>]*>?/gm, '')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      })}
    </Page>
  </Document>
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const locale = searchParams.get('lang') || 'ca';

  if (!token) return new NextResponse('Token required', { status: 400 });

  const supabase = await createClient();

  // 1. Verify token exists
  if (token !== 'preview') {
    const { data: validToken } = await supabase
      .from('access_tokens')
      .select('id')
      .eq('token', token)
      .maybeSingle();

    if (!validToken) return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Fetch CV Data
  const [cvRes, aboutRes] = await Promise.all([
    supabase.from('cv_sections').select('*').order('sort_order', { ascending: true }),
    supabase.from('about_me').select('*').single(),
  ]);

  const pdfStream = await ReactPDF.renderToStream(
    <CVDocument data={cvRes.data || []} locale={locale} about={aboutRes.data} />
  );

  // Convert stream to buffer
  const chunks: any[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="CV_${aboutRes.data?.name || 'Marc'}.pdf"`,
    },
  });
}
