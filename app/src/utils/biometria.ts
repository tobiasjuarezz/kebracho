import * as LocalAuthentication from 'expo-local-authentication';

export async function dispositivoSoportaFaceId(): Promise<boolean> {
  const tieneHardware = await LocalAuthentication.hasHardwareAsync();
  if (!tieneHardware) return false;
  const tieneRegistrado = await LocalAuthentication.isEnrolledAsync();
  return tieneRegistrado;
}

export async function autenticarConFaceId(mensaje: string): Promise<boolean> {
  try {
    const soportado = await dispositivoSoportaFaceId();
    if (!soportado) return false;

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: mensaje,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    return resultado.success;
  } catch (error) {
    console.error('Error en autenticación biométrica:', error);
    return false;
  }
}