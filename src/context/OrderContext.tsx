import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { initializeOrderSheet, getOrdersFromSheet } from '@/lib/sheets';
import { format, parse } from 'date-fns';

// Cache constants
const ORDERS_CACHE_KEY = 'cached_orders';
const CACHE_EXPIRY_KEY = 'cached_orders_expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface OrderContextProps {
  orders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
  addOrder: (order: Order) => Promise<void>;
  refreshOrders: () => Promise<void>;
  lastRefreshed: Date | null;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initialize sheets on component mount
  useEffect(() => {
    initializeOrderSheet()
      .then(success => {
        if (!success) {
          console.error('Failed to initialize Google Sheet');
        }
      })
      .catch(error => {
        console.error('Error initializing Google Sheet:', error);
      });
  }, []);

  // Check cache validity
  useEffect(() => {
    const cachedOrders = localStorage.getItem(ORDERS_CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (cachedOrders && expiry) {
      const isExpired = Date.now() > parseInt(expiry, 10);
      if (!isExpired) {
        try {
          setOrders(JSON.parse(cachedOrders));
          setLastRefreshed(new Date(parseInt(expiry, 10) - CACHE_DURATION));
          return;
        } catch (e) {
          // If parsing fails, clear the cache and continue to fetch
          localStorage.removeItem(ORDERS_CACHE_KEY);
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }
      } else {
        localStorage.removeItem(ORDERS_CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
      }
    }

    // If no valid cache, fetch orders from sheet
    refreshOrders();
  }, []);

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const addOrder = async (order: Order) => {
    try {
      // Simply add the order to the local state
      const orderId = order.id || `ORD-${Date.now()}`;
      const newOrder = {
        ...order,
        id: orderId,
      };
      
      // Update orders state with the new order
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      
      // Success notification
      toast({
        title: 'Order created',
        description: 'Order has been successfully created',
      });
      
      return;
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: 'Failed to create order',
        description: 'There was an error creating the order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      const sheetsData = await getOrdersFromSheet();
      
      // Transform the sheet data to match the Order type
      const transformedOrders: Order[] = sheetsData.map(order => ({
        id: order.orderNumber,
        clientName: order.customerName,
        items: [
          {
            name: "Order from sheet",
            quantity: 1,
            price: parseFloat(order.orderAmount) || 0
          }
        ],
        status: order.paymentStatus === 'Paid' ? 'Completed' : 'Processing',
        createdAt: format(parse(order.orderDate, 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        dueDate: order.dueDate,
        paymentOption: order.paymentOption,
        productDetails: order.productDetails,
        user: order.user
      }));
      
      setOrders(transformedOrders);
      setLastRefreshed(new Date());
      
      // Update cache
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(transformedOrders));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
      
      toast({
        title: 'Orders refreshed',
        description: 'Orders have been successfully loaded from Google Sheets',
      });
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast({
        title: 'Failed to refresh orders',
        description: 'There was an error loading orders from Google Sheets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, isLoading, getOrderById, addOrder, refreshOrders, lastRefreshed }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};