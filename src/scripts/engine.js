/**
 * Core Calculation Engine - rockcoveragecalculator.com
 * Precision geometric area, volumetric conversion, aggregate density,
 * compaction factors, reverse coverage, and purchasing logistics.
 */

const CU_FT_PER_CU_YD = 27;
const LBS_PER_TON = 2000;
const BAG_CU_FT = 0.5;
const SUPER_SACK_CU_FT = 35;
const WHEELBARROW_CU_FT = 6;
const DUMP_TRUCK_CU_YD = 10;

export const RockEngine = {

  /* ── Unit Conversions ── */

  feetToInches(ft) { return ft * 12; },
  inchesToFeet(inches) { return inches / 12; },
  metersToFeet(m) { return m * 3.28084; },
  centimetersToFeet(cm) { return cm / 30.48; },
  yardsToFeet(yd) { return yd * 3; },

  toFeet(value, unit) {
    const converters = {
      ft: (v) => v,
      in: (v) => v / 12,
      m: (v) => v * 3.28084,
      cm: (v) => v / 30.48,
      yd: (v) => v * 3,
    };
    return (converters[unit] || converters.ft)(value);
  },

  fromFeet(valueFt, unit) {
    const converters = {
      ft: (v) => v,
      in: (v) => v * 12,
      yd: (v) => v / 3,
      m: (v) => v / 3.28084,
      cm: (v) => v * 30.48,
    };
    return (converters[unit] || converters.ft)(valueFt);
  },

  formatInputValue(val) {
    if (val === null || val === undefined || isNaN(val)) return '';
    const rounded = Math.round(val * 100) / 100;
    return rounded.toString();
  },

  /* ── Area Calculations (all return sq ft) ── */

  areaRectangle(lengthFt, widthFt) {
    return lengthFt * widthFt;
  },

  areaCircle(radiusFt) {
    return Math.PI * radiusFt * radiusFt;
  },

  areaRing(outerRadiusFt, innerRadiusFt) {
    return Math.PI * (outerRadiusFt * outerRadiusFt - innerRadiusFt * innerRadiusFt);
  },

  areaTriangle(baseFt, heightFt) {
    return 0.5 * baseFt * heightFt;
  },

  areaTrapezoid(topFt, bottomFt, heightFt) {
    return 0.5 * (topFt + bottomFt) * heightFt;
  },

  areaLShape(l1Ft, w1Ft, l2Ft, w2Ft) {
    return (l1Ft * w1Ft) + (l2Ft * w2Ft);
  },

  calculateArea(shape, dims) {
    switch (shape) {
      case 'rectangle':
        return this.areaRectangle(dims.length, dims.width);
      case 'circle':
        return this.areaCircle(dims.radius);
      case 'ring':
        return this.areaRing(dims.outerRadius, dims.innerRadius);
      case 'triangle':
        return this.areaTriangle(dims.base, dims.height);
      case 'trapezoid':
        return this.areaTrapezoid(dims.top, dims.bottom, dims.height);
      case 'lshape':
        return this.areaLShape(dims.length1, dims.width1, dims.length2, dims.width2);
      default:
        return 0;
    }
  },

  /* ── Volume & Weight ── */

  volumeCuFt(areaSqFt, depthInches) {
    return areaSqFt * (depthInches / 12);
  },

  volumeCuYd(cuFt) {
    return cuFt / CU_FT_PER_CU_YD;
  },

  weightLbs(cuYd, densityLbsPerCuYd) {
    return cuYd * densityLbsPerCuYd;
  },

  weightTons(lbs) {
    return lbs / LBS_PER_TON;
  },

  /* ── Metric Conversions ── */

  sqFtToSqM(sqFt) { return sqFt * 0.092903; },
  sqMToSqFt(sqM) { return sqM / 0.092903; },
  cuYdToCuM(cuYd) { return cuYd * 0.764555; },
  cuMToCuYd(cuM) { return cuM / 0.764555; },
  cuFtToCuM(cuFt) { return cuFt * 0.0283168; },
  tonsToTonnes(tons) { return tons * 0.907185; },
  lbsToKg(lbs) { return lbs * 0.453592; },

  /* ── Purchasing ── */

  bags(cuFt) {
    // Standard retail bag volume basis: 0.5 cubic feet (~14 liters)
    return Math.ceil(cuFt / BAG_CU_FT);
  },

  superSacks(cuFt) {
    return Math.ceil(cuFt / SUPER_SACK_CU_FT);
  },

  wheelbarrowLoads(cuFt) {
    return Math.ceil(cuFt / WHEELBARROW_CU_FT);
  },

  dumpTruckLoads(cuYd) {
    return Math.ceil(cuYd / DUMP_TRUCK_CU_YD);
  },

  /* ── Waste / Settling ── */

  applyWaste(value, wastePercent) {
    return value * (1 + wastePercent / 100);
  },

  /* ── Full Calculation Pipeline ── */

  calculate(shape, dims, depthInches, material, wastePercent = 10) {
    const areaSqFt = this.calculateArea(shape, dims);
    const cuFtRaw = this.volumeCuFt(areaSqFt, depthInches);
    const cuFt = this.applyWaste(cuFtRaw, wastePercent);
    const cuYd = this.volumeCuYd(cuFt);
    const lbs = this.weightLbs(cuYd, material.densityLbsPerCuYd);
    const tons = this.weightTons(lbs);

    const belowMinDepth = depthInches < material.minDepthInches;
    const densityLbsPerCuFt = Math.round(material.densityLbsPerCuYd / CU_FT_PER_CU_YD);
    const densityKgPerCuM = Math.round((material.densityLbsPerCuYd / CU_FT_PER_CU_YD) * 16.0185);

    return {
      shape,
      materialId: material.id,
      materialName: material.name,
      areaSqFt: this.round(areaSqFt, 1),
      areaSqM: this.round(this.sqFtToSqM(areaSqFt), 2),
      depthInches,
      depthCm: this.round(depthInches * 2.54, 1),
      wastePercent,
      volumeCuFtRaw: this.round(cuFtRaw, 2),
      volumeCuFt: this.round(cuFt, 2),
      volumeCuYd: this.round(cuYd, 2),
      volumeCuM: this.round(this.cuYdToCuM(cuYd), 2),
      weightLbs: this.round(lbs, 0),
      weightKg: this.round(this.lbsToKg(lbs), 0),
      weightTons: this.round(tons, 2),
      weightTonnes: this.round(this.tonsToTonnes(tons), 2),
      bags: this.bags(cuFt),
      superSacks: this.superSacks(cuFt),
      wheelbarrowLoads: this.wheelbarrowLoads(cuFt),
      dumpTruckLoads: this.dumpTruckLoads(cuYd),
      belowMinDepth,
      minDepthInches: material.minDepthInches,
      densityLbsPerCuYd: material.densityLbsPerCuYd,
      densityLbsPerCuFt,
      densityKgPerCuM,
      tonsPerCuYd: material.tonsPerCuYd
    };
  },

  /* ── Reverse Calculation (from known quantity, find area) ── */

  reverseFromCuYd(cuYd, depthInches, wastePercent = 10) {
    const cuFt = cuYd * CU_FT_PER_CU_YD;
    const cuFtRaw = cuFt / (1 + wastePercent / 100);
    const areaSqFt = cuFtRaw / (depthInches / 12);
    return this.round(areaSqFt, 1);
  },

  reverseFromTons(tons, depthInches, densityLbsPerCuYd, wastePercent = 10) {
    const lbs = tons * LBS_PER_TON;
    const cuYd = lbs / densityLbsPerCuYd;
    return this.reverseFromCuYd(cuYd, depthInches, wastePercent);
  },

  /* ── Coverage Chart Data ── */

  coverageChartData(material, areaOrCuYd, mode = 'area') {
    const depths = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12];
    if (mode === 'area') {
      return depths.map(d => {
        const cuFt = this.volumeCuFt(areaOrCuYd, d);
        const cuYd = this.volumeCuYd(cuFt);
        const tons = this.weightTons(this.weightLbs(cuYd, material.densityLbsPerCuYd));
        return { depth: d, cuYd: this.round(cuYd, 2), tons: this.round(tons, 2) };
      });
    }
    return depths.map(d => {
      const cuFt = areaOrCuYd * CU_FT_PER_CU_YD;
      const area = cuFt / (d / 12);
      return { depth: d, areaSqFt: this.round(area, 0) };
    });
  },

  /* ── Utility ── */

  round(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  formatNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
};
