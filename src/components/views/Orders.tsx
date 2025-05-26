import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { useUser } from '@/context/UserContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, FileText, Plus, RefreshCw, MoreHorizontal, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import CreateOrderForm from '@/components/forms/CreateOrderForm';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Orders = () => {
  const { orders, isLoading, refreshOrders, lastRefreshed } = useOrders();
  const { currentUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<{text: string, orderId: string} | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ordersPerPage = 10; // Reduced to show more pages 
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productDetails && order.productDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ordersPerPage));
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
    
  const handleCreateInvoice = (orderId: string) => {
    navigate(`/invoice-creator?orderId=${orderId}`);
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Function to handle refreshing orders
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };
  
  // Function to handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsDeleting(true);
      
      // Call the webhook with the deletion action
      const response = await fetch('https://hook.us2.make.com/dctfnraofsjhxghvpo185ykj9km89t7u', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: orderId,
          action: "delete"
        }),
      });
      
      if (response.ok) {
        // Remove the order from local state
        await refreshOrders();
        setOrderToDelete(null);
        
        toast({
          title: "Order deleted",
          description: `Order ${orderId} has been successfully deleted.`,
        });
      } else {
        console.error('Failed to delete order:', await response.text());
        toast({
          variant: "destructive",
          title: "Failed to delete order",
          description: "There was a problem deleting the order. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Orders Dashboard</h1>
          <p className="text-muted-foreground flex items-center flex-wrap">
            Manage and process customer orders
            {isLoading ? (
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5"></span>
                Loading data...
              </span>
            ) : lastRefreshed ? (
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5"></span>
                Last updated: {format(lastRefreshed, 'MMM d, yyyy h:mm a')}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isRefreshing ? "secondary" : "outline"}
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            className={isRefreshing ? "animate-pulse" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => setIsCreateOrderOpen(true)}
            disabled={!currentUser}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer name"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <div className="overflow-auto" style={{ height: '430px' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow className="bg-muted/50 border-b-2">
                <TableHead className="w-[140px] py-3 font-bold">Order Number</TableHead>
                <TableHead className="py-3 font-bold">Customer Name</TableHead>
                <TableHead className="py-3 font-bold">Order Date</TableHead>
                <TableHead className="py-3 font-bold">Expected Due Date</TableHead>
                <TableHead className="py-3 font-bold">Order Amount</TableHead>
                <TableHead className="py-3 font-bold">Payment Option</TableHead>
                <TableHead className="py-3 font-bold">Payment Status</TableHead>
                <TableHead className="py-3 font-bold">Product Details</TableHead>
                <TableHead className="py-3 font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <TableRow 
                    key={order.id} 
                    className={`hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.clientName}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.dueDate ? format(new Date(order.dueDate), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {order.paymentOption === 'Full payment' ? 'Full payment' : 
                      order.paymentOption === 'Installments' ? 'Installments' : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Completed' 
                          ? 'outline' 
                          : order.status === 'Pending' 
                          ? 'secondary' 
                          : order.status === 'Cancelled' 
                          ? 'destructive' 
                          : 'default'
                      }
                      className="font-medium"
                      >
                        {order.status === 'Completed' ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.productDetails ? (
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                  onClick={() => setSelectedProductDetails({
                                    text: order.productDetails ?? '',
                                    orderId: order.id
                                  })}
                                >
                                  <span className="truncate max-w-[120px]">{order.productDetails}</span>
                                  <MoreHorizontal className="h-3 w-3 ml-1 text-gray-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to view full details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        'N/A'
                      )}
                      {/* User data is kept but hidden: {order.user || 'N/A'} */}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleCreateInvoice(order.id)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Create Invoice</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setOrderToDelete(order.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Delete Order</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center h-32">
                      {sortedOrders.length === 0 && (searchTerm || 'all') ? (
                        <>
                          <p className="text-muted-foreground mb-2">No matching orders found.</p>
                          <p className="text-sm text-muted-foreground">
                            Try changing your search term or filter criteria.
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-3" 
                            onClick={() => {
                              setSearchTerm('');
                            }}
                          >
                            Clear filters
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No orders available.</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between mt-4">
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-muted-foreground">
                Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, sortedOrders.length)} of {sortedOrders.length} orders
                {filteredOrders.length !== orders.length && (
                  <span className="text-xs ml-1">
                    (filtered from {orders.length} total orders)
                  </span>
                )}
              </p>
              
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            </div>
            
            <Pagination className="mt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted/80'}
                  />
                </PaginationItem>
                
                {/* First page always shown */}
                {totalPages > 5 && currentPage > 3 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer hover:bg-muted/80">
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis for many pages */}
                {totalPages > 7 && currentPage > 4 && (
                  <PaginationItem>
                    <div className="px-4">...</div>
                  </PaginationItem>
                )}
                
                {/* Dynamic page links */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(number => {
                    if (totalPages <= 7) return true;
                    const distanceFromCurrent = Math.abs(number - currentPage);
                    return distanceFromCurrent < 2 || number === 1 || number === totalPages;
                  })
                  .map(number => (
                    <PaginationItem key={number}>
                      <PaginationLink
                        onClick={() => setCurrentPage(number)}
                        isActive={currentPage === number}
                        className={`cursor-pointer ${currentPage === number ? 'font-bold' : 'hover:bg-muted/80'}`}
                      >
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                }
                
                {/* Ellipsis for many pages */}
                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <PaginationItem>
                    <div className="px-4">...</div>
                  </PaginationItem>
                )}
                
                {/* Last page always shown */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer hover:bg-muted/80">
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted/80'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            {currentPage === totalPages && totalPages > 1 && (
              <div className="text-sm text-muted-foreground mt-1 italic">
                You've reached the end of the list
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center items-center w-full mt-6">
          <Button 
            onClick={handleRefresh}
            variant={isRefreshing ? "secondary" : "outline"}
            className={`w-[200px] ${isRefreshing ? "animate-pulse" : ""}`}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? 'Refreshing data...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <CreateOrderForm 
        open={isCreateOrderOpen} 
        onOpenChange={setIsCreateOrderOpen} 
      />

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProductDetails} onOpenChange={() => setSelectedProductDetails(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-lg font-semibold">Product Details</span>
              {selectedProductDetails && (
                <>
                  <span className="text-xs ml-2 text-muted-foreground">
                    Order: {selectedProductDetails.orderId}
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="relative overflow-auto resize-y min-h-[200px] max-h-[400px] p-4 border rounded-md mt-2 mb-4 bg-muted/5">
            {selectedProductDetails && (
              <div className="whitespace-pre-wrap">{selectedProductDetails.text}</div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 22L12 22M22 22L22 12M22 22L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedProductDetails(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order will be permanently deleted from the system.
              <div className="mt-2 p-2 bg-muted rounded-md">
                <span className="font-medium">Order Number: </span>
                <span className="font-mono">{orderToDelete}</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (orderToDelete) {
                  handleDeleteOrder(orderToDelete);
                }
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;