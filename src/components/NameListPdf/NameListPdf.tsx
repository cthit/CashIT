import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
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
const NameListPdf = ({
  nl,
  locale,
  gammaNames
}: {
  nl: Awaited<ReturnType<typeof NameListService.getById>>;
  locale: string;
  gammaNames: { nick: string; amount: number }[];
}) => {
  if (nl === null) return null;

  const sum =
    (nl?.names.reduce((acc, name) => acc + name.cost, 0) ?? 0) +
    (gammaNames.reduce((acc, name) => acc + name.amount, 0) ?? 0);
  const typeStr = NameListService.prettifyType(nl.type, locale);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, styles.head]}>
          <View>
            <Text style={styles.title}>
              Teknologsektionen Informationsteknik
            </Text>
            <Text>Namnlista</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Typ</Text>
            <Text>{typeStr}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>Datum</Text>
            <Text>{i18nService.formatDate(nl.occurredAt, false)}</Text>
            <Text style={[styles.dataTitle, { marginTop: 15 }]}>
              Beskrivning
            </Text>
            <Text>{nl.name}</Text>
          </View>
          <View>
            <Text style={styles.dataTitle}>
              Exporterad {i18nService.formatDate(new Date())}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.head}>
            <Text>Namn</Text>
            {nl.tracked && <Text>Kostnad (kr)</Text>}
          </View>
          <View style={styles.hr} />
          {nl.names.map((name) => (
            <View key={name.id} style={styles.head}>
              <Text>{name.name}</Text>
              {nl.tracked && <Text>{name.cost.toFixed(2)}</Text>}
            </View>
          ))}
          {gammaNames.map((name) => (
            <View key={name.nick} style={styles.head}>
              <Text>{name.nick}</Text>
              {nl.tracked && <Text>{name.amount.toFixed(2)}</Text>}
            </View>
          ))}
          <View style={[styles.hr, { marginBottom: 15 }]} />
          <Text style={[styles.dataTitle, { textAlign: 'right' }]}>
            Antal personer
          </Text>
          <Text style={{ textAlign: 'right' }}>
            {nl.gammaNames.length + nl.names.length}
          </Text>
          {nl.tracked && (
            <>
              <Text
                style={[
                  styles.dataTitle,
                  { marginTop: 10, textAlign: 'right' }
                ]}
              >
                Total kostnad
              </Text>
              <Text style={{ textAlign: 'right' }}>{sum.toFixed(2)} kr</Text>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default NameListPdf;
