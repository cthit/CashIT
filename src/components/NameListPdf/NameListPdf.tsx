import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff',
      fontWeight: 400
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff',
      fontWeight: 700
    }
  ]
});
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/'
});

const TEAL = '#0d5f5f';
const TEAL_LIGHT = '#e6f5f5';
const TEAL_MID = '#b3d9d9';
const TEXT_DARK = '#1a1a1a';
const TEXT_MUTED = '#555555';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    fontSize: 11,
    color: TEXT_DARK,
    fontFamily: 'Inter'
  },
  headerBand: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 30,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerOrg: {
    fontSize: 18,
    color: TEAL,
    fontFamily: 'Inter',
    fontWeight: 700
  },
  headerLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    letterSpacing: 2
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 14
  },
  metaBlock: {
    flexDirection: 'column'
  },
  metaLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2
  },
  metaValue: {
    fontSize: 11
  },
  tableSection: {
    paddingHorizontal: 30,
    paddingTop: 5
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomColor: TEAL,
    borderBottomWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  tableHeaderCell: {
    color: TEAL,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
    fontWeight: 700
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8
  },
  tableRowEven: {
    backgroundColor: '#f5f5f5'
  },
  tableCell: {
    fontSize: 11
  },
  tableDivider: {
    borderBottomColor: TEAL_MID,
    borderBottomWidth: 1,
    marginTop: 4
  },
  totalsSection: {
    paddingHorizontal: 30,
    paddingTop: 10,
    alignItems: 'flex-end'
  },
  totalsBox: {
    width: '45%',
    borderWidth: 1,
    borderColor: TEAL_MID,
    borderRadius: 3,
    overflow: 'hidden'
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  totalsRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopColor: TEAL,
    borderTopWidth: 1.5
  },
  totalsLabel: {
    fontSize: 9,
    color: TEXT_MUTED
  },
  totalsValue: {
    fontSize: 11
  },
  totalsFinalLabel: {
    fontSize: 10,
    color: TEAL,
    fontFamily: 'Inter',
    fontWeight: 700
  },
  totalsFinalValue: {
    fontSize: 12,
    color: TEAL,
    fontFamily: 'Inter',
    fontWeight: 700
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor: TEAL_MID,
    borderTopWidth: 1,
    paddingTop: 6
  },
  footerText: {
    fontSize: 8,
    color: TEXT_MUTED
  }
});

// Create Document Component
const NameListPdf = ({
  nl,
  locale,
  gammaNames
}: {
  nl: Awaited<ReturnType<typeof NameListService.getById>>;
  locale: string;
  gammaNames: { fullName: string; amount: number }[];
}) => {
  if (nl === null) return null;

  const sum =
    (nl?.names.reduce((acc, name) => acc + name.cost, 0) ?? 0) +
    (gammaNames.reduce((acc, name) => acc + name.amount, 0) ?? 0);
  const typeStr = NameListService.prettifyType(nl.type, locale);
  const totalCount = nl.gammaNames.length + nl.names.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={styles.headerBand}>
          <Text style={styles.headerOrg}>
            Teknologsektionen Informationsteknik
          </Text>
          <Text style={styles.headerLabel}>NAMNLISTA</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Typ</Text>
            <Text style={styles.metaValue}>{typeStr}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Datum</Text>
            <Text style={styles.metaValue}>
              {i18nService.formatDate(nl.occurredAt, false)}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Beskrivning</Text>
            <Text style={styles.metaValue}>{nl.name}</Text>
          </View>
        </View>

        {/* Names table */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Namn</Text>
            {nl.tracked && (
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '25%', textAlign: 'right' }
                ]}
              >
                Kostnad (kr)
              </Text>
            )}
          </View>
          {nl.names.map((name, index) => (
            <View
              key={name.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1 }]}>{name.name}</Text>
              {nl.tracked && (
                <Text
                  style={[
                    styles.tableCell,
                    { width: '25%', textAlign: 'right' }
                  ]}
                >
                  {name.cost.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
          {gammaNames.map((name, index) => (
            <View
              key={name.fullName}
              style={[
                styles.tableRow,
                (nl.names.length + index) % 2 === 1 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {name.fullName}
              </Text>
              {nl.tracked && (
                <Text
                  style={[
                    styles.tableCell,
                    { width: '25%', textAlign: 'right' }
                  ]}
                >
                  {name.amount.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
          <View style={styles.tableDivider} />
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {nl.tracked && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total kostnad</Text>
                <Text style={styles.totalsValue}>{sum.toFixed(2)} kr</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Antal personer</Text>
              <Text style={styles.totalsValue}>{totalCount}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Skapad {i18nService.formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default NameListPdf;
