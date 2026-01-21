# Flexible Schema Implementation

## Overview
The DTI Price Monitoring system now supports a **fully flexible schema** that automatically adapts to whatever data structure you provide, whether from imports or manual entry.

## Key Features

### 1. Dynamic Column Detection
- Automatically detects all unique columns/attributes in your data
- No predefined schema restrictions
- Columns are intelligently ordered (common ones first, then alphabetically)

### 2. Smart Data Parsing
**CSV/XLSX Import** automatically:
- Preserves all columns from source files
- Auto-converts numeric values (prices, quantities, etc.)
- Handles flexible column naming (mixed case, underscores, spaces)
- Filters out empty/invalid rows

### 3. Dynamic Table Rendering
**All components dynamically render tables:**
- Monitoring page: Shows all records with all columns
- File Import: Live preview with all detected columns
- Automatically formatted displays (₱ for prices, dates formatted, etc.)

### 4. Intelligent Column Ordering
Preferred column order (if present):
1. commodity
2. store
3. municipality
4. price
5. prevPrice
6. srp
7. timestamp

Then remaining columns alphabetically.

## How to Use

### Importing Data
1. Click "Import Data" button in header
2. Upload CSV or XLSX file
3. File preview shows all detected columns
4. Click "Confirm Import" to save

### File Format Examples

**Flexible Column Names** - All these work:
```
commodity, store, price
Commodity, Store, Price
COMMODITY, STORE, PRICE
Product, Outlet, Cost
```

**Example CSV:**
```
commodity,store,municipality,price,prevPrice,srp,quality,branch
Rice,Savemore,Manila,45.50,43.00,50.00,A,001
Eggs,SM Hypermarket,Quezon City,8.50,8.00,9.50,Fresh,002
```

**Example XLSX:** Same format, paste into Excel or Google Sheets

### Adding Custom Fields
Simply add new columns to your import file - they'll automatically appear:
- `quality` → Shows in table as "Quality"
- `batch_number` → Shows in table as "Batch Number"
- `supplier_code` → Shows in table as "Supplier Code"

## Technical Details

### Files Modified:
- `fileImportService.js` - Preserves all columns from imports
- `schemaUtils.js` - NEW: Utilities for dynamic column handling
- `FileImport.jsx` - Shows all columns in preview
- `Monitoring.jsx` - Dynamic table with all columns
- `Dashboard.jsx` - Uses only relevant columns for analysis

### Utility Functions:
- `getDynamicColumns()` - Extract all unique columns
- `getOrderedColumns()` - Get ordered columns
- `formatColumnName()` - Convert column names for display
- `formatCellValue()` - Format values intelligently (₱, dates, etc.)

## Benefits

✅ No schema migrations needed
✅ Import any CSV/XLSX format
✅ Add custom fields without code changes
✅ Auto-formatted displays
✅ Intelligent column ordering
✅ Future-proof data structure
