/**
 * Intelligent Evaluator Engine
 * Parses limits like "30 MAX", "50 MIN", "10-20" and checks against result.
 */
export class EvaluatorEngine {
  static evaluateSpec(result: string | number, spec: string): boolean | null {
    if (!result || result === '-' || result === '---' || !spec || spec === '-----') return null;
    
    const resNum = typeof result === 'string' ? parseFloat(result) : result;
    if (isNaN(resNum)) return null;

    const specUpper = spec.toUpperCase();

    if (specUpper.includes('MAX')) {
      const maxNum = parseFloat(specUpper.replace(/[^\d.-]/g, ''));
      if (!isNaN(maxNum)) return resNum <= maxNum;
    } else if (specUpper.includes('MIN')) {
      const minNum = parseFloat(specUpper.replace(/[^\d.-]/g, ''));
      if (!isNaN(minNum)) return resNum >= minNum;
    } else if (specUpper.includes('-')) {
      const parts = specUpper.split('-');
      if (parts.length === 2) {
        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          return resNum >= min && resNum <= max;
        }
      }
    }
    
    return null; // Cannot be evaluated automatically
  }
}
