import { useEffect } from 'react';

/**
 * usePrintScale
 * 
 * Calcula el factor de escala para que el template del reporte
 * (ancho fijo `reportWidth` px) siempre quepa en el papel impreso,
 * sin importar si es portrait o landscape.
 *
 * Aplica el scale como CSS custom property --print-scale en :root
 * y también actualiza el style inline del wrapper con id `printScaleWrapperId`.
 */
export function usePrintScale(
  reportWidth: number = 980,
  printScaleWrapperId: string = 'print-scale-wrapper'
) {
  useEffect(() => {
    const applyScale = () => {
      // Ancho disponible en mm → convertir a px con 96dpi
      // Usamos window.innerWidth como proxy del tamaño de papel
      // cuando se activa el diálogo de impresión el navegador
      // usa el ancho del viewport de impresión.
      // La forma más confiable: escalar contra el ancho real del contenedor
      const availableWidth = window.innerWidth; 
      const scale = Math.min(1, (availableWidth - 32) / reportWidth);

      const wrapper = document.getElementById(printScaleWrapperId);
      if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'top center';
        // Ajustar la altura del wrapper para que no deje espacio en blanco
        wrapper.style.marginBottom = `${(scale - 1) * wrapper.scrollHeight}px`;
      }

      document.documentElement.style.setProperty('--print-scale', String(scale));
    };

    // Aplicar al montar y en cada resize
    applyScale();
    window.addEventListener('resize', applyScale);

    // Calcular la escala ANTES de que el browser abra el diálogo de print
    const beforePrint = () => {
      // Para impresión: usar el ancho de papel en px (A4: 210mm = ~794px @ 96dpi)
      // Letter: 216mm = ~816px. Usamos el mínimo seguro de ambos: 780px útiles
      const printAvailableWidth = 780;
      const printScale = Math.min(1, printAvailableWidth / reportWidth);
      const wrapper = document.getElementById(printScaleWrapperId);
      if (wrapper) {
        wrapper.style.transform = `scale(${printScale})`;
        wrapper.style.transformOrigin = 'top center';
      }
    };

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', applyScale);

    return () => {
      window.removeEventListener('resize', applyScale);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', applyScale);
    };
  }, [reportWidth, printScaleWrapperId]);
}
