import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { History } from "../../models/History";
import { toImageSrc } from "../utils";

const COLORS = {
  primaryGreen: "#4CAF50",
  darkGreen: "#2E7D32",
  lightGreen: "#E8F5E9",
  lightGray: "#F0F4F8",
  mediumGray: "#8A8A8E",
  darkGray: "#424242",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.darkGray,
    paddingBottom: 56,
  },
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 22,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: COLORS.white,
  },
  brandSub: {
    fontSize: 8.5,
    color: COLORS.lightGreen,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.white,
  },
  reportDate: {
    fontSize: 8,
    color: COLORS.lightGreen,
    marginTop: 3,
  },
  body: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  metaRow: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7.5,
    color: COLORS.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGray,
  },
  topSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  imageWrapper: {
    width: 170,
    height: 170,
    borderRadius: 4,
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 4,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 8,
    color: COLORS.mediumGray,
  },
  summaryCol: {
    flex: 1,
    gap: 10,
  },
  summaryBlock: {
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
  },
  summaryBlockLast: {
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGreen,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: 7.5,
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
  },
  badgeOutline: {
    borderRadius: 8,
    border: `1px solid ${COLORS.primaryGreen}`,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeOutlineText: {
    fontSize: 7.5,
    color: COLORS.darkGreen,
    fontFamily: "Helvetica-Bold",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGray,
    marginBottom: 5,
    paddingLeft: 8,
    borderLeft: `3px solid ${COLORS.primaryGreen}`,
  },
  sectionText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLORS.darkGray,
  },
  highlightBox: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 4,
    padding: 12,
    border: `1px solid ${COLORS.primaryGreen}55`,
  },
  disclaimer: {
    marginTop: 6,
    padding: 10,
    borderRadius: 4,
    backgroundColor: COLORS.lightGray,
  },
  disclaimerText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: COLORS.mediumGray,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderTop: `1px solid ${COLORS.border}`,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: COLORS.mediumGray,
  },
});

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Section({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

export interface AnalysisReportDocumentProps {
  analysis: History;
}

export function AnalysisReportDocument({ analysis }: AnalysisReportDocumentProps) {
  const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });
  const analyzedAt = format(
    new Date(analysis.createdAt),
    "dd 'de' MMMM 'de' yyyy, HH:mm",
    { locale: ptBR }
  );
  const isHealthy = !analysis.sicknessId;
  const imageSrc = analysis.image ? toImageSrc(analysis.image) : undefined;

  return (
    <Document
      title={`Relatório de Análise - ${analysis.crop || "AgroScope"}`}
      author="AgroScope"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AgroScope</Text>
            <Text style={styles.brandSub}>
              Diagnóstico inteligente de doenças em plantas
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>
              Relatório de Análise Fitossanitária
            </Text>
            <Text style={styles.reportDate}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <MetaItem label="Data da análise" value={analyzedAt} />
            <MetaItem
              label="Nº do relatório"
              value={analysis.id.slice(0, 8).toUpperCase()}
            />
          </View>

          <View style={styles.topSection}>
            {imageSrc ? (
              <View style={styles.imageWrapper}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop */}
                <Image src={imageSrc} style={styles.image} />
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  Imagem não disponível
                </Text>
              </View>
            )}

            <View style={styles.summaryCol}>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Cultura Identificada</Text>
                <View style={styles.summaryValueRow}>
                  <Text style={styles.summaryValue}>
                    {analysis.crop || "Não identificada"}
                  </Text>
                  {analysis.cropConfidence != null && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {(analysis.cropConfidence * 100).toFixed(1)}% confiança
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.summaryBlock, styles.summaryBlockLast]}>
                <Text style={styles.summaryLabel}>Diagnóstico</Text>
                <View style={styles.summaryValueRow}>
                  <Text style={styles.summaryValue}>
                    {isHealthy
                      ? "Nenhuma doença identificada"
                      : analysis.explanation || "Não identificado"}
                  </Text>
                  {!isHealthy && analysis.sicknessConfidence != null && (
                    <View style={styles.badgeOutline}>
                      <Text style={styles.badgeOutlineText}>
                        {(analysis.sicknessConfidence * 100).toFixed(1)}% confiança
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <Section title="Causas / Sintomas" text={analysis.causes} />

          {analysis.handling && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recomendações de Manejo
              </Text>
              <View style={styles.highlightBox}>
                <Text style={styles.sectionText}>{analysis.handling}</Text>
              </View>
            </View>
          )}

          <Section title="Precauções" text={analysis.precautions} />

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Este relatório foi gerado automaticamente por inteligência
              artificial e tem caráter meramente informativo. Consulte um
              agrônomo para confirmar o diagnóstico e obter recomendações
              específicas para a sua lavoura.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            AgroScope • Relatório gerado automaticamente
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
