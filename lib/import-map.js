/** mapExternalRowToProduct — pure (catalog lists as params) */
import { pickField, splitList, normKey } from '@/lib/import-csv';
import { toFa } from '@/lib/format-digits';
import {
  matchCatalogColor as matchCatalogColorLib,
  matchCatalogSize as matchCatalogSizeLib,
  matchCatalogBrand as matchCatalogBrandLib,
  matchCategory as matchCategoryLib,
} from '@/lib/catalog-match';

export function mapExternalRowToProduct(
  row,
  source,
  warnings,
  idx,
  { colors: catalogColors = [], sizes: catalogSizes = [], brands: catalogBrands = [], categories: catalogCategories = [] } = {},
) {
  const matchCatalogColor = (name) => matchCatalogColorLib(name, catalogColors);
  const matchCatalogSize = (name) => matchCatalogSizeLib(name, catalogSizes);
  const matchCatalogBrand = (name) => matchCatalogBrandLib(name, catalogBrands);
  const matchCategory = (name) => matchCategoryLib(name, catalogCategories);

        let name = '', sku = '', desc = '', price = 0, oldPrice = 0, stock = 0, image = '', status = 'pending';
        let sizeRaw = [], colorRaw = [], catsRaw = [], tagsRaw = [], brandRaw = '';
        let imagesAll = [];
        let extraAttrs = [];

        if (source === 'shopify') {
          name = pickField(row, ['Title', 'title']);
          sku = pickField(row, ['Variant SKU', 'SKU', 'Handle']);
          desc = pickField(row, ['Body (HTML)', 'Body', 'body_html']);
          price = Number(String(pickField(row, ['Variant Price', 'Price'])).replace(/[^\d.]/g, '')) || 0;
          oldPrice = Number(String(pickField(row, ['Variant Compare At Price', 'Compare At Price']) || '').replace(/[^\d.]/g, '')) || 0;
          stock = Number(String(pickField(row, ['Variant Inventory Qty', 'Inventory Qty']).replace(/[^\d]/g, '')) || 0);
          image = pickField(row, ['Image Src', 'Image URL', 'Image']);
          imagesAll = splitList(image).concat(splitList(pickField(row, ['Variant Image']))).filter(Boolean);
          if (row._images) imagesAll = [...imagesAll, ...row._images];
          brandRaw = pickField(row, ['Vendor', 'Brand']);
          catsRaw = splitList(pickField(row, ['Type', 'Product Category', 'Category']));
          tagsRaw = splitList(pickField(row, ['Tags']));
          const opt1n = normKey(pickField(row, ['Option1 Name']));
          const opt1v = pickField(row, ['Option1 Value']);
          const opt2n = normKey(pickField(row, ['Option2 Name']));
          const opt2v = pickField(row, ['Option2 Value']);
          const opt3n = normKey(pickField(row, ['Option3 Name']));
          const opt3v = pickField(row, ['Option3 Value']);
          [[opt1n, opt1v], [opt2n, opt2v], [opt3n, opt3v]].forEach(([n, v]) => {
            if (!v) return;
            if (n.includes('size') || n.includes('سایز') || n === 'size') sizeRaw.push(...splitList(v));
            else if (n.includes('color') || n.includes('colour') || n.includes('رنگ')) colorRaw.push(...splitList(v));
            else if (matchCatalogSize(v)) sizeRaw.push(v);
            else if (matchCatalogColor(v)) colorRaw.push(v);
            else if (n) extraAttrs.push({ name: n, value: v });
          });
          const pub = pickField(row, ['Published']);
          if (pub && /false|0|no/i.test(pub)) status = 'inactive';
          else status = 'pending';
        } else {
          // WooCommerce
          name = pickField(row, ['Name', 'Post Title', 'Title']);
          sku = pickField(row, ['SKU', 'Id', 'ID']);
          desc = pickField(row, ['Description', 'Short description', 'Short Description']);
          price = Number(String(pickField(row, ['Regular price', 'Regular Price', 'Price'])).replace(/[^\d.]/g, '')) || 0;
          oldPrice = Number(String(pickField(row, ['Sale price', 'Sale Price'])).replace(/[^\d.]/g, '')) || 0;
          // if sale price is lower, swap semantics: our oldPrice = regular, price = sale
          const reg = price;
          const sale = oldPrice;
          if (sale > 0 && sale < reg) { price = sale; oldPrice = reg; }
          else { oldPrice = 0; }
          stock = Number(String(pickField(row, ['Stock', 'In stock?', 'Stock quantity']).replace(/[^\d]/g, '')) || 0);
          imagesAll = splitList(pickField(row, ['Images', 'Image', 'Featured image']));
          image = imagesAll[0] || '';
          catsRaw = splitList(pickField(row, ['Categories', 'Category']));
          tagsRaw = splitList(pickField(row, ['Tags', 'Tag']));
          brandRaw = pickField(row, ['Brands', 'Brand', 'Attribute: Brand', 'Attribute 3 value(s)']);
          // attributes
          for (let a = 1; a <= 5; a++) {
            const an = normKey(pickField(row, [`Attribute ${a} name`, `Attribute ${a} Name`]));
            const av = pickField(row, [`Attribute ${a} value(s)`, `Attribute ${a} value`, `Attribute ${a} Values`]);
            if (!an && !av) continue;
            if (an.includes('size') || an.includes('سایز')) sizeRaw.push(...splitList(av));
            else if (an.includes('color') || an.includes('colour') || an.includes('رنگ')) colorRaw.push(...splitList(av));
            else if (an.includes('brand') || an.includes('برند')) brandRaw = brandRaw || av;
            else {
              extraAttrs.push({ name: an, value: av });
              splitList(av).forEach(v => {
                if (matchCatalogSize(v)) sizeRaw.push(v);
                else if (matchCatalogColor(v)) colorRaw.push(v);
              });
            }
          }
          const pub = pickField(row, ['Published', 'Status']);
          if (pub && (/^-1$|draft|private|0/i.test(pub))) status = 'inactive';
          else status = 'pending';
        }

        if (!name) {
          warnings.push(`ردیف ${idx + 1}: بدون نام — رد شد`);
          return null;
        }
        if (!(price > 0)) {
          warnings.push(`«${name}»: قیمت نامعتبر — رد شد`);
          return null;
        }

        // ——— نگاشت نرم: فقط مقادیر کاتالوگ ادمین ذخیره می‌شود؛ ناشناخته‌ها با fallback و هشدار ———
        // سایز
        const unmatchedSizes = [...new Set(sizeRaw)].filter(s => !matchCatalogSize(s));
        let sizes = [...new Set(sizeRaw.map(s => matchCatalogSize(s)?.name).filter(Boolean))];
        if (unmatchedSizes.length) {
          warnings.push(`«${name}»: سایزهای خارج از کاتالوگ نادیده گرفته شد: ${unmatchedSizes.join('، ')}`);
        }
        if (!sizes.length) {
          const fallbackSizes = _catSizes().filter(s => s.active !== false).map(s => s.name);
          const prefer = ['M', 'L', 'S', 'XL'].map(x => fallbackSizes.find(s => normKey(s) === normKey(x))).filter(Boolean);
          sizes = prefer.length ? prefer.slice(0, 2) : fallbackSizes.slice(0, 2);
          if (!sizes.length) sizes = ['M'];
          warnings.push(`«${name}»: سایز از کاتالوگ ادمین جایگزین شد (${sizes.join('، ')})`);
        }

        // رنگ
        const unmatchedColors = [...new Set(colorRaw)].filter(cn => !matchCatalogColor(cn));
        let colors = [];
        [...new Set(colorRaw)].forEach(cn => {
          const hit = matchCatalogColor(cn);
          if (hit) colors.push({ name: hit.name, hex: hit.hex, image: image || undefined });
        });
        if (unmatchedColors.length) {
          warnings.push(`«${name}»: رنگ‌های خارج از کاتالوگ نادیده گرفته شد: ${unmatchedColors.join('، ')}`);
        }
        if (!colors.length) {
          const fb = _catColors().find(c => c.active !== false);
          if (fb) {
            colors = [{ name: fb.name, hex: fb.hex, image: image || undefined }];
            warnings.push(`«${name}»: رنگ از کاتالوگ ادمین جایگزین شد (${fb.name})`);
          } else {
            colors = [{ name: 'پیش‌فرض', hex: '#888888', image: image || undefined }];
            warnings.push(`«${name}»: رنگ پیش‌فرض اعمال شد (کاتالوگ رنگ ادمین خالی است)`);
          }
        }
        if (image) colors = colors.map((c, i) => (i === 0 ? { ...c, image } : c));

        // برند — در صورت نبود، اولین برند فعال ادمین
        let brandObj = matchCatalogBrand(brandRaw);
        if (!brandObj) {
          brandObj = _catBrands().find(b => b.active !== false) || null;
          if (brandObj) {
            warnings.push(`«${name}»: برند «${brandRaw || 'خالی'}» در کاتالوگ نبود — جایگزین: ${brandObj.name}`);
          } else {
            warnings.push(`«${name}»: رد شد — هیچ برندی در کاتالوگ ادمین تعریف نشده`);
            return null;
          }
        }

        // دسته — در صورت نبود، اولین دسته فعال
        let categories = [...new Set(catsRaw.map(x => matchCategory(x)).filter(Boolean))].slice(0, 3);
        const unmatchedCats = [...new Set(catsRaw)].filter(x => !matchCategory(x));
        if (unmatchedCats.length) {
          warnings.push(`«${name}»: دسته‌های خارج از لیست ادمین نادیده گرفته شد: ${unmatchedCats.join('، ')}`);
        }
        if (!categories.length) {
          const fbCat = _catCategories().find(c => c.active !== false);
          if (fbCat) {
            categories = [fbCat.name];
            warnings.push(`«${name}»: دسته از لیست ادمین جایگزین شد (${fbCat.name})`);
          } else {
            categories = ['عمومی'];
            warnings.push(`«${name}»: دسته «عمومی» اعمال شد (دسته‌بندی ادمین خالی است)`);
          }
        }

        // برچسب: فقط برچسب‌های تعریف‌شده ادمین (اگر ادمین تگ داشته باشد)
        const adminTagNames = _catTags().filter(t => t.active !== false).map(t => t.name);
        let tags = [];
        if (adminTagNames.length) {
          const unmatchedTags = tagsRaw.filter(t => !adminTagNames.some(a => normKey(a) === normKey(t)));
          tags = tagsRaw.filter(t => adminTagNames.some(a => normKey(a) === normKey(t))).slice(0, 5);
          if (unmatchedTags.length) {
            warnings.push(`«${name}»: برچسب‌های خارج از لیست ادمین حذف شد: ${unmatchedTags.join('، ')}`);
          }
        } else {
          // اگر ادمین هنوز تگی نساخته، برچسب‌ها وارد نمی‌شوند
          tags = [];
          if (tagsRaw.length) warnings.push(`«${name}»: برچسب‌ها وارد نشد (هنوز برچسبی در پنل ادمین تعریف نشده)`);
        }
                const discount = oldPrice > price && oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : undefined;
        const priceText = toFa(Math.round(price).toLocaleString('en-US'));

        // تصاویر: لیست URLها · اولی = تصویر شاخص
        const imgList = (Array.isArray(imagesAll) ? imagesAll : (image ? [image] : []))
          .map(u => String(u || '').trim())
          .filter(Boolean)
          .slice(0, 3);
        if (imgList.length && colors.length) {
          colors = colors.map((col, i) => ({ ...col, image: col.image || imgList[Math.min(i, imgList.length - 1)] }));
          colors[0] = { ...colors[0], image: imgList[0] };
        }

        // ویژگی‌ها از attributeهای فایل → فقط گزینه‌های کاتالوگ ادمین
        const attributes = {};
        const attrWarnings = [];
        _catAttrs().filter(a => a.active !== false).forEach(attr => {
          const limited = attr.categoryNames || [];
          if (limited.length && !categories.some(cat => limited.includes(cat))) return;
          // پیدا کردن مقدار خام هم‌نام
          let rawVals = [];
          (extraAttrs || []).forEach(({ name: an, value: av }) => {
            if (normKey(an) === normKey(attr.name) || normKey(an).includes(normKey(attr.name)) || normKey(attr.name).includes(normKey(an))) {
              rawVals.push(...splitList(av));
            }
          });
          const matched = rawVals.filter(v => (attr.options || []).some(o => normKey(o) === normKey(v)));
          const mapped = matched.map(v => (attr.options || []).find(o => normKey(o) === normKey(v))).filter(Boolean);
          if (attr.required && !mapped.length) {
            attrWarnings.push(attr.name);
            return;
          }
          if (mapped.length) {
            attributes[attr.id] = attr.multi ? [...new Set(mapped)] : mapped[0];
          }
        });
        if (attrWarnings.length) {
          warnings.push(`«${name}»: ویژگی اجباری بدون مقدار معتبر نادیده گرفته شد: ${attrWarnings.join('، ')}`);
        }

        const _impId = 'imp-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2, 6);
        const _impCode = generateProductCode(brandObj?.id || brandObj?.name || 'IMP', _impId);
        return {
          id: _impId,
          productCode: _impCode,
          name,
          sku: sku || undefined,
          category: categories[0],
          categories,
          tags,
          desc: desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000),
          price: Math.round(price),
          oldPrice: oldPrice > price ? toFa(Math.round(oldPrice).toLocaleString('en-US')) : undefined,
          discount,
          priceText,
          stock: Math.max(0, Math.round(stock)),
          sizes,
          colors,
          brandId: brandObj?.id,
          brand: brandObj?.name,
          brandName: brandObj?.name,
          attributes,
          images: imgList,
          featuredImageIndex: 0,
          status,
          contentStatus: 'pending',
          rating: 0,
          reviews: 0,
          sellerName: brandObj?.name || 'وارداتی',
          sellerId: 'import',
          importSource: source,
          importedAt: new Date().toISOString(),
        };
      }
