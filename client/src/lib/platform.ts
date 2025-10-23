import { Capacitor } from '@capacitor/core';

/**
 * Détecte si l'application s'exécute en mode natif (mobile) ou web
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
