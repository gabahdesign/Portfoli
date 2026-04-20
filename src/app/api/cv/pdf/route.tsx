import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToStream, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTURjIg1_i6t8kCHKm45_dJE3gnD_g.ttf', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Montserrat', backgroundColor: '#ffffff' },
  header: { borderBottomWidth: 2, borderBottomColor: '#FF0A0A', paddingBottom: 15, marginBottom: 20 },
  name: { fontSize: 26, fontWeight: 700, color: '#111' },
  tagline: { fontSize: 11, color: '#555', marginTop: 5, fontWeight: 400 },
  contact: { flexDirection: 'row', gap: 15, marginTop: 10, fontSize: 9, color: '#777' },
  contactItem: { flexDirection: 'row', alignItems: 'center' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#FF0A0A', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4, marginBottom: 10 },
  item: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitleBlock: { flex: 1, paddingRight: 10 },
  itemTitle: { fontSize: 12, fontWeight: 700, color: '#111' },
  itemSubtitle: { fontSize: 10, fontWeight: 700, color: '#FF0A0A', marginTop: 2 },
  itemDate: { fontSize: 9, color: '#888' },
  itemDesc: { fontSize: 9, color: '#444', marginTop: 4, lineHeight: 1.5, fontWeight: 400 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langItem: { width: '30%', backgroundColor: '#f8f8f8', padding: 8, borderRadius: 4 },
  langName: { fontSize: 10, fontWeight: 700 },
  langLevel: { fontSize: 8, color: '#888', marginTop: 2 }
});

const CVDocument = ({ aboutData, experience, education, languages }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{aboutData?.name ?? "Marc"}</Text>
          <Text style={styles.tagline}>{typeof aboutData?.tagline === 'object' ? aboutData.tagline.ca : (aboutData?.tagline ?? "")}</Text>
          <View style={styles.contact}>
            {aboutData?.email && <Text style={styles.contactItem}>✉  {aboutData.email}</Text>}
            {aboutData?.phone && <Text style={styles.contactItem}>📞  {aboutData.phone}</Text>}
          </View>
        </View>

        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiència professional</Text>
            {experience.map((item: any, i: number) => {
              const content = Array.isArray(item.content) ? item.content : [];
              return content.map((exp: any, j: number) => (
                <View key={`exp-${i}-${j}`} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleBlock}>
                      <Text style={styles.itemTitle}>{exp.title ?? ""}</Text>
                      <Text style={styles.itemSubtitle}>{exp.place ?? exp.company ?? ""}</Text>
                    </View>
                    <Text style={styles.itemDate}>
                      {exp.date_start ?? ""}{exp.date_end ? " – " + exp.date_end : " – Actual"}
                    </Text>
                  </View>
                  {exp.description && <Text style={styles.itemDesc}>{exp.description}</Text>}
                </View>
              ));
            })}
          </View>
        )}

        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formació</Text>
            {education.map((item: any, i: number) => {
              const content = Array.isArray(item.content) ? item.content : [];
              return content.map((edu: any, j: number) => (
                <View key={`edu-${i}-${j}`} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleBlock}>
                      <Text style={styles.itemTitle}>{edu.title ?? ""}</Text>
                      <Text style={styles.itemSubtitle}>{edu.place ?? edu.institution ?? ""}</Text>
                    </View>
                    <Text style={styles.itemDate}>
                      {edu.date_start ?? ""}{edu.date_end ? " – " + edu.date_end : ""}
                    </Text>
                  </View>
                  {edu.description && <Text style={styles.itemDesc}>{edu.description}</Text>}
                </View>
              ));
            })}
          </View>
        )}

        {languages && languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomes</Text>
            <View style={styles.langGrid}>
              {languages.map((item: any, i: number) => {
                const content = Array.isArray(item.content) ? item.content : [];
                return content.map((lang: any, j: number) => (
                  <View key={`lang-${i}-${j}`} style={styles.langItem}>
                    <Text style={styles.langName}>{lang.name ?? lang.title ?? ""}</Text>
                    <Text style={styles.langLevel}>{lang.level ?? ""}</Text>
                  </View>
                ));
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const [cvRes, aboutRes] = await Promise.all([
      supabase.from("cv_sections").select("*").order("display_order", { ascending: true }),
      supabase.from("about_me").select("*").single()
    ]);

    const cvData = cvRes.data;
    const aboutData = aboutRes.data;

    if (!cvData) {
      return NextResponse.json({ error: "No CV data found" }, { status: 404 });
    }

    const experience = cvData.filter((s: any) => s.section === "experience");
    const education = cvData.filter((s: any) => s.section === "education");
    const languages = cvData.filter((s: any) => s.section === "languages");

    const stream = await renderToStream(
      <CVDocument 
        aboutData={aboutData} 
        experience={experience} 
        education={education} 
        languages={languages} 
      />
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CV-${aboutData?.name ?? 'Marc'}.pdf"`
      },
    });

  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Error generating PDF: " + err.message }, { status: 500 });
  }
}
