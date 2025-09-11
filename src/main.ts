import { bridgeLegacy } from './shell/legacy-bridge';
import { bootstrap } from './shell/bootstrap';
import { bindMatrixUI } from './features/matrix/ui';

async function main(): Promise<void> {
  await bridgeLegacy();
  bootstrap();
  bindMatrixUI();
}

void main();
