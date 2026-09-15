/** Product form variant matrix helper — extracted from App (قدم ۶۹) */

/**
 * @param {object} f form
 * @param {object} opts
 * @param {Array} opts.adminCatalogColors
 * @param {Array} opts.adminCatalogAttributes
 * @param {(attrs:object, catalog:Array)=>any} opts.getAttrDimensions
 * @param {(s:string)=>string|number} opts.onlyDigits
 * @param {Function} opts.buildVariantMatrix
 */
export function syncFormVariants(f, opts = {}) {
  const {
    adminCatalogColors = [],
    adminCatalogAttributes = [],
    getAttrDimensions,
    onlyDigits,
    buildVariantMatrix,
  } = opts;
  const colorNames = (adminCatalogColors || [])
    .filter((c) => (f.colorIds || []).includes(c.id))
    .map((c) => c.name);
  const sizes = f.sizes || [];
  const attrDims = getAttrDimensions
    ? getAttrDimensions(f.attributes || {}, adminCatalogAttributes || [])
    : [];
  const basePrice = onlyDigits ? onlyDigits(String(f.price || "")) || f.price : f.price;
  const baseStock = onlyDigits ? onlyDigits(String(f.stock || "")) || f.stock : f.stock;
  return buildVariantMatrix(colorNames, sizes, attrDims, basePrice, baseStock, f.variants || []);
}
