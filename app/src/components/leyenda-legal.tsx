import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { LEYENDA_LEGAL } from '../constants/marca';

// Leyenda obligatoria (Ley 24.788). Va en todas las pantallas donde se ofrece producto.
export default function LeyendaLegal({ style }: { style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.leyenda, style]}>{LEYENDA_LEGAL}</Text>;
}

const styles = StyleSheet.create({
  leyenda: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
