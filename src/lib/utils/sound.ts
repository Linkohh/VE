export function playSound(id: string): void {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(id) as HTMLAudioElement | null;
    if (!element) return;

    try {
        element.currentTime = 0;
        void element.play();
    } catch (error) {
        console.warn(`Unable to play sound with id "${id}".`, error);
    }
}
