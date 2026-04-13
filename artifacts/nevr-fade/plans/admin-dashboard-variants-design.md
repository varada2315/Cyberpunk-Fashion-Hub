# Admin Dashboard Design for Product Variants Management

## Overview
An enhanced admin dashboard that allows managing products with multiple variants (colors, sizes, and stock levels for each variant).

## Dashboard Layout

```
+-----------------------------------------------------------+
| LOGO | Products | Stock | Add Product | Admin Profile |
+-----------------------------------------------------------+
|                                                           |
|  [Search Products]                                        |
|                                                           |
|  +----------------+----------------+----------------+     |
|  | Product Image  | Product Name   | Stock Level    |     |
|  | [Thumbnail]    | [Product Name] | [12 in stock]  |     |
|  |                | Price: ₹999    | [Edit Stock]   |     |
|  |                | Category: Tech | [Edit Details] |     |
|  +----------------+----------------+----------------+     |
|  +----------------+----------------+----------------+     |
|  | Product Image  | Product Name   | Stock Level    |     |
|  | [Thumbnail]    | [Product Name] | [0 in stock]   |     |
|  |                | Price: ₹1,299  | [Edit Stock]   |     |
|  |                | Category: Wear | [Edit Details] |     |
|  +----------------+----------------+----------------+     |
|                                                           |
|  [Add New Product Button]                                 |
|                                                           |
+-----------------------------------------------------------+
```

## Product Variants Management

### Product Listing with Variants
- Clean card layout with product thumbnail, name, price, and category
- Stock level displayed prominently with color coding (green for available, red for out of stock)
- Two simple action buttons: "Edit Stock" and "Edit Details"
- Search bar at the top to find products quickly

### Edit Stock for Variants Interface
- When clicking "Edit Stock", show a detailed view of all variants
- For each variant (color + size combination):
  - Display color swatch
  - Display size label
  - Input field for stock quantity
  - "Save" button for that variant
- Visual indication of which variants are in/out of stock
- Simple "Save All" button to save all changes at once

### Add New Product with Variants
- Form with 6 simple fields:
  - Product Name (text input)
  - Price (number input)
  - Category (dropdown: Wear, Tech, Accessories, etc.)
  - Initial Stock (number input)
  - Colors (multiple selection or input)
  - Sizes (multiple selection or input)
- "Create Product" button

### Variant Management Features
- Add new color/size combinations
- Remove color/size combinations
- Edit stock levels for each color/size combination
- Visual indicators for stock status
- Clear, simple interface without technical terms

## User Flow for Variants
1. Admin logs in to dashboard
2. Sees all products in a clean grid
3. To manage variants: Click "Edit Stock" → See all color/size combinations
4. Update stock levels for individual variants
5. Click "Save All" to apply changes
6. To add new product with variants: Click "Add New Product" → Fill form → Click "Create"

## Visual Design for Variants
- Color swatches for each variant
- Clear size labels
- Large, easy-to-read stock inputs
- Visual feedback for changes
- Responsive layout for all devices
- No technical jargon - just "Add" or "Remove" stock

## Accessibility
- Large touch targets for buttons
- Clear visual feedback for all actions
- Colorblind-friendly palette
- Simple language throughout
- Keyboard accessible form elements