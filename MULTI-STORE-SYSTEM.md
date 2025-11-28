# Multi-Store System Documentation

## Overview
This system supports multiple physical store locations with individual inventory management, allowing customers to choose between delivery or in-store pickup.

## Database Schema

### New Models

#### **Store**
Represents a physical store location.

```prisma
model Store {
  id              String           @id @default(cuid())
  name            String           // e.g., "OG Farms - Cape Town"
  slug            String           @unique
  address         String
  city            String
  state           String
  zipCode         String
  country         String           @default("South Africa")
  phone           String
  email           String?
  latitude        Float?           // For map integration
  longitude       Float?
  openingHours    Json?            // Store hours
  isActive        Boolean          @default(true)
  allowsPickup    Boolean          @default(true)
  inventory       StoreInventory[]
  orders          Order[]
  createdAt       DateTime
  updatedAt       DateTime
}
```

**Opening Hours JSON Format:**
```json
{
  "monday": { "open": "09:00", "close": "18:00" },
  "tuesday": { "open": "09:00", "close": "18:00" },
  "wednesday": { "open": "09:00", "close": "18:00" },
  "thursday": { "open": "09:00", "close": "18:00" },
  "friday": { "open": "09:00", "close": "20:00" },
  "saturday": { "open": "10:00", "close": "20:00" },
  "sunday": { "closed": true }
}
```

#### **StoreInventory**
Tracks product stock levels at each store.

```prisma
model StoreInventory {
  id              String   @id @default(cuid())
  storeId         String
  productId       String
  quantity        Int      @default(0)
  lowStockAlert   Int      @default(10)
  store           Store
  product         Product
  createdAt       DateTime
  updatedAt       DateTime
}
```

### Updated Models

#### **Product**
- **Removed:** Global `stock` field
- **Added:** `storeInventory` relation (one product can have inventory at multiple stores)

#### **Order**
- **Added:** `fulfillmentType` (DELIVERY or PICKUP)
- **Added:** `pickupStore` relation
- **Added:** `pickupStoreId`
- **Updated:** `shippingCost` defaults to 0 (no cost for pickup)

#### **OrderStatus Enum**
Added new statuses:
- `READY_FOR_PICKUP` - Order is ready to be collected
- `PICKED_UP` - Customer has collected the order

## Customer Flow

### 1. Browse Products
- Products show **total availability** across all stores
- Product page displays which stores have stock
- "Check Store Availability" feature

### 2. Add to Cart
- Cart items are not tied to a specific store yet
- System will validate availability at checkout

### 3. Checkout - Choose Fulfillment
Customer selects one of two options:

#### **Option A: Delivery**
1. Select/enter delivery address
2. System calculates shipping cost
3. Order is fulfilled from nearest store with stock
4. Status flow: PENDING → PROCESSING → SHIPPED → DELIVERED

#### **Option B: Store Pickup**
1. Select pickup store from list of stores with stock
2. No shipping cost
3. Order is prepared at selected store
4. Customer receives notification when ready
5. Status flow: PENDING → PROCESSING → READY_FOR_PICKUP → PICKED_UP

### 4. Order Confirmation
- Shows fulfillment type
- For delivery: shipping address and tracking
- For pickup: store address, hours, and pickup instructions

## Admin Dashboard Features

### Store Management
1. **Add/Edit Stores**
   - Store details (name, address, contact)
   - Location coordinates for maps
   - Opening hours
   - Enable/disable pickup option
   - Activate/deactivate store

2. **View All Stores**
   - List of all stores
   - Quick stats (total inventory, pending orders)
   - Active/inactive status

### Inventory Management
1. **Per-Store Inventory**
   - View stock levels for each product at each store
   - Bulk import/export inventory
   - Transfer stock between stores
   - Set low stock alerts per store

2. **Stock Operations**
   - Add stock to store
   - Remove stock from store
   - Adjust stock levels
   - View stock history/audit log

3. **Stock Alerts**
   - Low stock notifications per store
   - Out of stock alerts
   - Automatic reorder suggestions

### Order Management
1. **Filter by Store**
   - View orders by fulfillment store
   - Pickup orders vs delivery orders

2. **Pickup Order Workflow**
   - Mark order as "Ready for Pickup"
   - Send customer notification
   - Mark as "Picked Up" when collected
   - Verify customer ID at pickup

## API Endpoints to Create

### Store APIs
```
GET    /api/stores                    - List all active stores
GET    /api/stores/:id                - Get store details
POST   /api/admin/stores              - Create store (admin)
PUT    /api/admin/stores/:id          - Update store (admin)
DELETE /api/admin/stores/:id          - Delete store (admin)
GET    /api/stores/:id/inventory      - Get store inventory
```

### Inventory APIs
```
GET    /api/admin/inventory                           - All inventory
GET    /api/admin/inventory/store/:storeId            - Store inventory
GET    /api/admin/inventory/product/:productId        - Product across stores
POST   /api/admin/inventory                           - Add inventory
PUT    /api/admin/inventory/:id                       - Update inventory
POST   /api/admin/inventory/transfer                  - Transfer between stores
GET    /api/products/:id/availability                 - Check product availability
```

### Checkout APIs
```
POST   /api/checkout/validate-pickup   - Validate pickup store has stock
POST   /api/checkout/calculate-shipping - Calculate shipping (or 0 for pickup)
POST   /api/checkout/create-order      - Create order with fulfillment type
```

## Frontend Components to Create

### 1. Store Locator
- Map showing all stores
- List view with filters
- Store details (hours, address, contact)
- "Select for Pickup" button

### 2. Product Availability
- "Check Store Availability" modal
- Shows stock at each store
- Option to select store for pickup

### 3. Checkout Fulfillment Selector
- Radio buttons: Delivery vs Pickup
- If Delivery: address form
- If Pickup: store selector with availability

### 4. Admin - Store Management
- Store list page
- Add/edit store form
- Store details page with inventory

### 5. Admin - Inventory Management
- Inventory dashboard
- Stock level tables
- Add/adjust stock forms
- Transfer stock between stores

## Migration Steps

1. **Update Schema**
   ```bash
   # Already done - schema.prisma updated
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_multi_store_system
   ```

3. **Seed Initial Data**
   - Create at least one store
   - Migrate existing product stock to StoreInventory

4. **Update Existing Code**
   - Product queries: join with StoreInventory
   - Cart validation: check store availability
   - Checkout: add fulfillment type selection

## Example Queries

### Get Product with Store Availability
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    storeInventory: {
      include: {
        store: {
          select: {
            id: true,
            name: true,
            city: true,
            allowsPickup: true,
          }
        }
      },
      where: {
        quantity: { gt: 0 },
        store: { isActive: true }
      }
    }
  }
})
```

### Get Total Stock Across All Stores
```typescript
const totalStock = await prisma.storeInventory.aggregate({
  where: { productId },
  _sum: { quantity: true }
})
```

### Create Pickup Order
```typescript
const order = await prisma.order.create({
  data: {
    userId,
    orderNumber,
    fulfillmentType: 'PICKUP',
    pickupStoreId: selectedStoreId,
    shippingCost: 0,
    // ... other fields
  }
})
```

## Business Logic Rules

1. **Stock Validation**
   - For pickup: validate selected store has sufficient stock
   - For delivery: check if any store has stock (fulfill from nearest)

2. **Inventory Deduction**
   - Deduct from specific store when order is placed
   - For delivery: choose optimal store (nearest, most stock, etc.)

3. **Pickup Notifications**
   - Email when order is ready for pickup
   - SMS reminder with store address and hours

4. **Stock Transfers**
   - Admin can transfer stock between stores
   - Audit log for all transfers
   - Prevent negative stock

## Future Enhancements

1. **Smart Fulfillment**
   - Auto-select optimal store for delivery based on distance
   - Split orders across multiple stores if needed

2. **Real-time Inventory**
   - WebSocket updates for stock changes
   - Reserve stock during checkout process

3. **Store Analytics**
   - Sales per store
   - Popular products per location
   - Inventory turnover rates

4. **Customer Preferences**
   - Save preferred pickup store
   - Notify when product available at preferred store
