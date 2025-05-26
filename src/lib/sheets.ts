// NOTE: Google Sheets integration is now handled via webhooks to Make.com

// Interface for order data to be saved to Google Sheets
export interface OrderSheetData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  dueDate: string;
  orderAmount: string;
  paymentOption: string;
  paymentStatus: string;
  productDetails: string;
  user: string;
}

// Function to add a new order to Google Sheets via webhook
export async function addOrderToSheet(order: OrderSheetData): Promise<boolean> {
  try {
    console.log('Order will be synced to Google Sheets via webhook:', order);
    await fetch('https://hook.us2.make.com/dctfnraofsjhxghvpo185ykj9km89t7u', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return true;
  } catch (error) {
    console.error('Error processing order for sheets sync:', error);
    return false;
  }
}

// Function to retrieve orders from the webhook endpoint
export async function getOrdersFromSheet(): Promise<OrderSheetData[]> {
  try {
    const response = await fetch('https://hook.us2.make.com/q25h0riyk3mm8vdrgpb35wly1e9x515e', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Orders retrieved from webhook:', data);
    
    // Define an interface for the numbered properties format
    interface NumberedOrderData {
      [key: string]: string;
    }
    
    // Handle the specific Google Sheets format with nested body array
    if (Array.isArray(data) && data.length > 0 && data[0].body && Array.isArray(data[0].body)) {
      // Transform the numbered properties format to OrderSheetData
      return data[0].body.map((item: NumberedOrderData) => ({
        orderNumber: item["0"] || "",
        customerName: item["1"] || "",
        orderDate: item["2"] || "",
        dueDate: item["3"] || "",
        orderAmount: item["4"] || "",
        paymentOption: item["5"] || "",
        paymentStatus: item["6"] || "",
        productDetails: item["7"] || "",
        user: item["8"] || ""
      }));
    }
    
    // Handle direct array with numbered properties (based on your console log)
    if (Array.isArray(data) && data.length > 0 && "0" in data[0]) {
      // Transform the numbered properties format to OrderSheetData
      return data.map((item: NumberedOrderData) => ({
        orderNumber: item["0"] || "",
        customerName: item["1"] || "",
        orderDate: item["2"] || "",
        dueDate: item["3"] || "",
        orderAmount: item["4"] || "",
        paymentOption: item["5"] || "",
        paymentStatus: item["6"] || "",
        productDetails: item["7"] || "",
        user: item["8"] || ""
      }));
    }
    
    // Handle direct array format (as fallback)
    if (Array.isArray(data)) {
      return data as OrderSheetData[];
    }
    
    // Handle object with orders array (as fallback)
    if (data && data.orders && Array.isArray(data.orders)) {
      return data.orders as OrderSheetData[];
    }
    
    // Fallback if the structure is unexpected
    console.warn('Unexpected data structure from webhook:', data);
    return [];
  } catch (error) {
    console.error('Error retrieving orders from webhook:', error);
    return [];
  }
}

// No-op: Sheet initialization is now handled by Make.com webhooks
export async function initializeOrderSheet(): Promise<boolean> {
  return true;
}