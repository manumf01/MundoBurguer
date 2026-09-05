/** Verdadero si el dispositivo tiene puntero fino (ratón): solo entonces los
 *  popovers se abren al pasar por encima; en táctil se abren al tocar. */
export function canHover(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}
