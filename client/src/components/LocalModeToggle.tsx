import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Database, Cloud } from 'lucide-react';
import { useLocalMode, enableLocalMode, disableLocalMode, localDB } from '../lib/localDB';

export function LocalModeToggle() {
  const isLocalMode = useLocalMode();
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = async () => {
    setIsLoading(true);
    
    try {
      if (isLocalMode) {
        // Passer en mode en ligne
        disableLocalMode();
      } else {
        // Passer en mode local
        await localDB.init();
        enableLocalMode();
      }
    } catch (error) {
      console.error('Erreur lors du changement de mode:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isLocalMode ? "secondary" : "default"} className="flex items-center gap-1">
        {isLocalMode ? (
          <>
            <Database className="w-3 h-3" />
            Mode Local
          </>
        ) : (
          <>
            <Cloud className="w-3 h-3" />
            Mode En ligne
          </>
        )}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMode}
        disabled={isLoading}
        className="flex items-center gap-1"
        data-testid="toggle-local-mode"
      >
        {isLocalMode ? (
          <>
            <Wifi className="w-4 h-4" />
            Passer en ligne
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            Passer en local
          </>
        )}
      </Button>
      
      {!navigator.onLine && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="w-3 h-3" />
          Hors ligne
        </Badge>
      )}
    </div>
  );
}