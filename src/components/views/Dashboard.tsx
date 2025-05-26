import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { staffData, staffPerformance } from '@/data/staffData';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalOrders: number;
  invoicesSent: number;
  messagesReceived: number;
  avgResponseTime: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    invoicesSent: 0,
    messagesReceived: 0,
    avgResponseTime: '0h'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (ordersError) throw ordersError;
        
        // Fetch invoices count
        const { count: invoicesCount, error: invoicesError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true });
        
        if (invoicesError) throw invoicesError;
        
        // Fetch messages count
        const { count: messagesCount, error: messagesError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
        
        if (messagesError) throw messagesError;
        
        setStats({
          totalOrders: ordersCount || 0,
          invoicesSent: invoicesCount || 0,
          messagesReceived: messagesCount || 0,
          avgResponseTime: '4.2h' // This would be calculated in a real app
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-1">Staff Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's a summary of your team's activity.</p>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{isLoading ? '...' : stats.totalOrders}</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Orders from database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Invoices Sent</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{isLoading ? '...' : stats.invoicesSent}</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Invoices from database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Messages Received</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{isLoading ? '...' : stats.messagesReceived}</CardTitle>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Messages from database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Response Time</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{stats.avgResponseTime}</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Based on last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Orders by Staff</CardTitle>
            <CardDescription>Monthly breakdown of orders handled by each staff member</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {staffData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="Jan" fill="#333" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Feb" fill="#555" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Mar" fill="#777" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Apr" fill="#999" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No staff performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No recent activity available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
          <CardDescription>Overview of staff workload and response metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {staffPerformance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Orders Handled</TableHead>
                  <TableHead>Avg. Response Time</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffPerformance.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.ordersHandled}</TableCell>
                    <TableCell>{staff.avgResponseTime}</TableCell>
                    <TableCell>{staff.completionRate}</TableCell>
                    <TableCell>
                      <Badge variant={staff.status === 'Active' ? 'outline' : 'secondary'}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No staff performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;