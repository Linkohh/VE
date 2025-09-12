import { bridgeLegacy } from './shell/legacy-bridge';
import { bootstrap } from './shell/bootstrap';
import { bindControls } from './features/ui/bindControls';
 

async function main(): Promise<void> {
  await bridgeLegacy();
  initMatrix();
  bootstrap();
  bindMatrixUI();
  bindControls();
}

void main();
