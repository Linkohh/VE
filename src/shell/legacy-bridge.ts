export async function bridgeLegacy(): Promise<void> {
  await import('../legacy/main-legacy.js');
}
