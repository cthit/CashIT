import { FormInvoiceItem } from '@/app/[locale]/org/[orgId]/receipt-creator/ReceiptCreateForm';
import i18nService from '@/services/i18nService';
import { InvoiceItemVat } from '@prisma/client';
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
const BORDER = '#cccccc';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    fontSize: 11,
    color: TEXT_DARK,
    fontFamily: 'Inter'
  },
  // Header band
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
  // Meta row
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
  // Items table
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
  // Totals
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
  // Signatures
  signSection: {
    paddingHorizontal: 30,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signColumn: {
    flexDirection: 'column'
  },
  signLineBox: {
    marginTop: 40,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 3
  },
  signPrefilledName: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 2
  },
  signRoleLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2
  },
  signTitle: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 700,
    marginBottom: 2
  },
  signLabel: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 2
  },
  // Footer
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
const ReceiptPdf = ({
  items,
  name,
  purchaser,
  treasurer,
  seller,
  date,
  locale: _locale,
  orgName,
  manualVatMode = false
}: {
  items: FormInvoiceItem[];
  name: string;
  purchaser: string;
  treasurer: string;
  seller?: string;
  date: Date;
  locale: string;
  orgName: string;
  manualVatMode?: boolean;
}) => {
  const rowTotal = (item: FormInvoiceItem) => {
    const base = +item.count * +item.amount;
    if (
      manualVatMode &&
      item.vatAmount !== undefined &&
      item.vatAmount !== ''
    ) {
      return base + +item.vatAmount;
    }
    return base * vatToNumber(item.vat);
  };
  const sum = items.reduce((acc, item) => acc + rowTotal(item), 0);
  const sumNoVat = items.reduce(
    (acc, item) => acc + +item.count * +item.amount,
    0
  );

  const hasSeller = seller && seller.trim() !== '';
  const signColWidth = hasSeller ? '30%' : '44%';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={styles.headerBand}>
          <Text style={styles.headerOrg}>{orgName}</Text>
          <Text style={styles.headerLabel}>KVITTO</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Datum</Text>
            <Text style={styles.metaValue}>
              {i18nService.formatDate(date, false)}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Beskrivning</Text>
            <Text style={styles.metaValue}>{name}</Text>
          </View>
          <View style={[styles.metaBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Skapad</Text>
            <Text style={styles.metaValue}>
              {i18nService.formatDate(new Date(), false)}
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Vara</Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: '15%', textAlign: 'right' }
              ]}
            >
              Antal
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: '15%', textAlign: 'right' }
              ]}
            >
              Á-pris
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: '15%', textAlign: 'right' }
              ]}
            >
              Moms
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: '15%', textAlign: 'right' }
              ]}
            >
              Belopp
            </Text>
          </View>
          {items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={[styles.tableCell, { width: '40%' }]}>
                {item.name}
              </Text>
              <Text
                style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}
              >
                {(+item.count).toFixed(2)}
              </Text>
              <Text
                style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}
              >
                {(+item.amount).toFixed(2)}
              </Text>
              <Text
                style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}
              >
                {vatToText(item.vat)}
              </Text>
              <Text
                style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}
              >
                {rowTotal(item).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Summa utan moms</Text>
              <Text style={styles.totalsValue}>{sumNoVat.toFixed(2)} kr</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Moms</Text>
              <Text style={styles.totalsValue}>
                {(sum - sumNoVat).toFixed(2)} kr
              </Text>
            </View>
            <View style={styles.totalsRowLast}>
              <Text style={styles.totalsFinalLabel}>Summa totalt</Text>
              <Text style={styles.totalsFinalValue}>{sum.toFixed(2)} kr</Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signSection}>
          <View style={[styles.signColumn, { width: signColWidth }]}>
            <View style={styles.signLineBox}>
              <Text style={{ fontSize: 10, color: '#cccccc' }}> </Text>
            </View>
            <Text style={styles.signLabel}>Signatur kassör</Text>
            <Text style={styles.signPrefilledName}>{treasurer}</Text>
            <Text style={styles.signRoleLabel}>Namnförtydligande</Text>
          </View>

          <View style={[styles.signColumn, { width: signColWidth }]}>
            <View style={styles.signLineBox}>
              <Text style={{ fontSize: 10, color: '#cccccc' }}> </Text>
            </View>
            <Text style={styles.signLabel}>Signatur inköpare</Text>
            <Text style={styles.signPrefilledName}>{purchaser}</Text>
            <Text style={styles.signRoleLabel}>Namnförtydligande</Text>
          </View>

          {hasSeller && (
            <View style={[styles.signColumn, { width: signColWidth }]}>
              <View style={styles.signLineBox}>
                <Text style={{ fontSize: 10, color: '#cccccc' }}> </Text>
              </View>
              <Text style={styles.signLabel}>Signatur säljare</Text>
              <Text style={styles.signPrefilledName}>{seller}</Text>
              <Text style={styles.signRoleLabel}>Namnförtydligande</Text>
            </View>
          )}
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

const vatToText = (vat: InvoiceItemVat) => {
  switch (vat) {
    case InvoiceItemVat.VAT_0:
      return '0%';
    case InvoiceItemVat.VAT_6:
      return '6%';
    case InvoiceItemVat.VAT_12:
      return '12%';
    case InvoiceItemVat.VAT_25:
      return '25%';
    default:
      return '';
  }
};

const vatToNumber = (vat: InvoiceItemVat) => {
  switch (vat) {
    case InvoiceItemVat.VAT_0:
      return 1.0;
    case InvoiceItemVat.VAT_6:
      return 1.06;
    case InvoiceItemVat.VAT_12:
      return 1.12;
    case InvoiceItemVat.VAT_25:
      return 1.25;
    default:
      return 1.0;
  }
};

export default ReceiptPdf;
