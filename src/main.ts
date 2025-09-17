import { bridgeLegacy } from './shell/legacy-bridge';
import { bootstrap } from './shell/bootstrap';
import { bindControls } from './features/ui/bindControls';
import './features/quotes';
import { initFavorites } from './features/favorites/wiring';
 

async function main(): Promise<void> {
  await bridgeLegacy();
  initMatrix();
  bootstrap();
  bindMatrixUI();
  bindControls();
  initFavorites();
}

void main();
