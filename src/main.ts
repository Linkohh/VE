import { bridgeLegacy } from './shell/legacy-bridge';
import { bootstrap } from './shell/bootstrap';
import { initMatrix } from './features/matrix/engine';

async function main(): Promise<void> {
  await bridgeLegacy();
  initMatrix();
  bootstrap();
}

void main();
