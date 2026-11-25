/** Noms des champs du formulaire de réservation (partagés entre le navigateur et le serveur). */
export const qtyField = (code: string, size: string | null) => (size ? `qty_${code}__${size}` : `qty_${code}`);
export const accessoryField = (code: string) => `acc_${code}`;
