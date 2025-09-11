import { bridgeLegacy } from './shell/legacy-bridge';
import { bootstrap } from './shell/bootstrap';
 

async function main(): Promise<void> {
  await bridgeLegacy();
  initMatrix();
  bootstrap();
  bindMatrixUI();
}

void main();
