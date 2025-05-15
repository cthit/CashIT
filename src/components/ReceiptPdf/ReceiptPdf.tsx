import {
  FormInvoiceItem,
  formToInvoiceItem
} from '@/app/[locale]/receipt-creator/ReceiptCreateForm';
import i18nService from '@/services/i18nService';
import InvoiceService from '@/services/invoiceService';
import NameListService from '@/services/nameListService';
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
  date,
  locale
}: {
  items: FormInvoiceItem[];
  name: string;
  purchaser: string;
  treasurer: string;
  date: Date;
  locale: string;
}) => {
  const invoiceItems = items.map((i) => formToInvoiceItem(i));

  const sum = InvoiceService.calculateSumForItems(invoiceItems);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, styles.head]}>
          <View>
            <Text style={styles.title}>
              Teknologsektionen Informationsteknik
            </Text>
            <Text>Kvitto</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Datum</Text>
            <Text>{i18nService.formatDate(date, false)}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>
              Beskrivning
            </Text>
            <Text>{name}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Inköpare</Text>
            <Text>{purchaser}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Kassör</Text>
            <Text>{treasurer}</Text>
          </View>
          <View>
            <Text style={styles.dataTitle}>
              Exporterad {i18nService.formatDate(new Date())}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.head}>
            <Text>Vara</Text>
            <Text>Kostnad (kr)</Text>
          </View>
          <View style={styles.hr} />
          {invoiceItems.map((item, index) => (
            <View key={index} style={styles.head}>
              <Text>{item.name}</Text>
              <Text>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.hr, { marginBottom: 15 }]} />
          <Text style={[styles.dataTitle, { textAlign: 'right' }]}>
            Antal varor
          </Text>
          <Text style={{ textAlign: 'right' }}>{invoiceItems.length}</Text>
          <Text
            style={[styles.dataTitle, { marginTop: 10, textAlign: 'right' }]}
          >
            Totalt
          </Text>
          <Text style={{ textAlign: 'right' }}>{sum.toFixed(2)} kr</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPdf;
