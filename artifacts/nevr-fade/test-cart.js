// Simple test to verify cart functionality
import fs from 'fs';

// Check if the cart hook file exists and has proper content
const cartHookContent = fs.readFileSync('./src/hooks/useCart.ts', 'utf8');
console.log('Cart hook file exists and has content');

// Check if App.tsx includes CartProvider
const appContent = fs.readFileSync('./src/App.tsx', 'utf8');
if (appContent.includes('CartProvider')) {
  console.log('✓ CartProvider is included in App.tsx');
} else {
  console.log('✗ CartProvider is missing from App.tsx');
}

// Check if Products page uses useCart
const productsContent = fs.readFileSync('./src/pages/Products.tsx', 'utf8');
if (productsContent.includes('useCart')) {
  console.log('✓ useCart is imported and used in Products.tsx');
} else {
  console.log('✗ useCart is missing from Products.tsx');
}

// Check if ProductDetail page uses useCart
const productDetailContent = fs.readFileSync('./src/pages/ProductDetail.tsx', 'utf8');
if (productDetailContent.includes('useCart')) {
  console.log('✓ useCart is imported and used in ProductDetail.tsx');
} else {
  console.log('✗ useCart is missing from ProductDetail.tsx');
}

// Check if Cart page uses useCart
const cartContent = fs.readFileSync('./src/pages/Cart.tsx', 'utf8');
if (cartContent.includes('useCart')) {
  console.log('✓ useCart is imported and used in Cart.tsx');
} else {
  console.log('✗ useCart is missing from Cart.tsx');
}

console.log('Test completed');
