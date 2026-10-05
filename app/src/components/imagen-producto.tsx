import { useState } from 'react';
import { Image, Text, View, StyleProp, ViewStyle } from 'react-native';

type Props = {
  url: string | null | undefined;
  tamanioEmoji: number;
  style: StyleProp<ViewStyle>;
};

// Muestra la foto del producto si tiene una URL válida.
// Si no tiene foto o no carga, muestra el emoji como antes.
export default function ImagenProducto({ url, tamanioEmoji, style }: Props) {
  const [fallo, setFallo] = useState(false);
  const tieneFoto = !!url && /^https?:\/\//.test(url) && !fallo;

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      {tieneFoto ? (
        <Image
          source={{ uri: url! }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setFallo(true)}
        />
      ) : (
        <Text style={{ fontSize: tamanioEmoji }}>🍾</Text>
      )}
    </View>
  );
}
