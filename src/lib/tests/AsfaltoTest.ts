import { ITestStrategy, TestResult } from './TestInterface';
import { EvaluatorEngine } from '../engine/EvaluatorEngine';

export interface AsfaltoData {
  licitacionNo: string;
  ensayeNo: string;
  fechaRecibo: string;
  fechaInforme: string;
  descripcionMaterial: string;
  paraUsarseEn: string;
  tratamientoPrevio: string;
  claseDeposito: string;
  ubicacionBanco: string;
  clasificacionPetrografica: string;
  pesoVolSuelto: string;
  normaGranulometria: string;
  caracteristicasAgregado: Array<{
    car: string;
    norma: string;
    res: string;
    proy: string;
  }>;
  granulometria: Array<{
    malla: string;
    pasa: number;
    min: number;
    max: number;
  }>;
  mezcla: unknown;
  especimen: unknown;
  asfalto: unknown;
  observaciones: string;
  tecnico: string;
  formatoUnico: string;
  extras: unknown;
}

export class AsfaltoTest implements ITestStrategy<AsfaltoData> {
  name = 'Asfalto';
  description = 'Ensaye de Concreto Asfáltico y Agregados';

  calculate(data: AsfaltoData): AsfaltoData {
    // Core Engine: Here we would put any complex calculations for asphalt
    return data;
  }

  evaluate(data: AsfaltoData): Record<string, TestResult> {
    const results: Record<string, TestResult> = {};
    
    // Evaluate Aggregates
    data.caracteristicasAgregado.forEach((item, index) => {
      const isPass = EvaluatorEngine.evaluateSpec(item.res, item.proy);
      if (isPass !== null) {
        results[`agregado_${index}`] = {
          passed: isPass,
          expected: item.proy,
          actual: item.res
        };
      }
    });

    // Evaluate Granulometry
    data.granulometria.forEach((item, index) => {
       const isPass = item.pasa >= item.min && item.pasa <= item.max;
       results[`granulometria_${index}`] = {
         passed: isPass,
         expected: `${item.min}-${item.max}`,
         actual: item.pasa
       };
    });

    return results;
  }

  generateReportData(data: AsfaltoData): unknown {
    return data;
  }
}
