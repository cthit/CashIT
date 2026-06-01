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
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/'
});

const styles = StyleSheet.create({
  doc: {
    flexDirection: 'row'
  },
  page: {
    flexDirection: 'column',
    fontSize: 15
  },
  title: {
    fontSize: 18
  },
  section: {
    margin: 10,
    padding: 10
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  signArea: {
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  signature: {
    marginTop: 50
  },
  signName: {
    marginTop: 25
  },
  signColumn: {
    width: '40%'
  },
  head: {
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  hr: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 5
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 15
  },
  dataTitle: {
    fontSize: 11
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, styles.head]}>
          <View>
            <Text style={styles.title}>{orgName}</Text>
            <Text>Kvitto</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Datum</Text>
            <Text>{i18nService.formatDate(date, false)}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>
              Beskrivning
            </Text>
            <Text>{name}</Text>
          </View>
          <View>
            <Text style={styles.dataTitle}>
              Skapad {i18nService.formatDate(new Date())}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={{ width: '40%' }}>Vara</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>Antal</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>Á pris</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>Moms</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>Belopp</Text>
          </View>
          <View style={styles.hr} />
          {items.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={{ width: '40%' }}>{item.name}</Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>
                {(+item.count).toFixed(2)}
              </Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>
                {(+item.amount).toFixed(2)}
              </Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>
                {vatToText(item.vat)}
              </Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>
                {rowTotal(item).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={[styles.hr, { marginBottom: 15 }]} />
          <Text
            style={[styles.dataTitle, { marginTop: 10, textAlign: 'right' }]}
          >
            Summa utan moms
          </Text>
          <Text style={{ textAlign: 'right' }}>{sumNoVat.toFixed(2)} kr</Text>
          <Text
            style={[styles.dataTitle, { marginTop: 10, textAlign: 'right' }]}
          >
            Moms
          </Text>
          <Text style={{ textAlign: 'right' }}>
            {(sum - sumNoVat).toFixed(2)} kr
          </Text>
          <Text
            style={[styles.dataTitle, { marginTop: 10, textAlign: 'right' }]}
          >
            Summa totalt
          </Text>
          <Text style={{ textAlign: 'right' }}>{sum.toFixed(2)} kr</Text>
        </View>
        <View style={styles.signArea}>
          <View style={styles.signColumn}>
            <View style={styles.signature}>
              <View style={styles.hr} />
              <Text style={styles.dataTitle}>Kassör signatur</Text>
            </View>
            <View style={styles.signName}>
              <Text>{treasurer}</Text>
              <View style={styles.hr} />
              <Text style={styles.dataTitle}>Kassör, namnförtydligande</Text>
            </View>
          </View>

          <View style={styles.signColumn}>
            <View style={styles.signature}>
              <View style={styles.hr} />
              <Text style={styles.dataTitle}>Inköpare signatur</Text>
            </View>
            <View style={styles.signName}>
              <Text>{purchaser}</Text>
              <View style={styles.hr} />
              <Text style={styles.dataTitle}>Inköpare, namnförtydligande</Text>
            </View>
          </View>
        </View>
        {seller && seller.trim() !== '' && (
          <View style={[styles.section, { paddingTop: 0 }]}>
            <Text style={styles.dataTitle}>Säljare</Text>
            <Text>{seller}</Text>
          </View>
        )}
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
