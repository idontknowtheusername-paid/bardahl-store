import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Eye,
  Percent,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { t } = useLanguage();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, created_at, payment_status, items');

      const totalOrders = orders?.length || 0;
      const paidOrders = orders?.filter(o => o.payment_status === 'paid') || [];
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      // Calculate conversion rate (paid orders / total orders)
      const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

      // Get products count and low stock
      const { data: products } = await supabase
        .from('products')
        .select('id, stock, is_active, title');

      const totalProducts = products?.filter(p => p.is_active).length || 0;
      const lowStock = products?.filter(p => (p.stock || 0) <= 5).length || 0;

      // Calculate top products from order items
      const productSales: Record<string, { title: string; quantity: number; revenue: number }> = {};

      paidOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.product_id || item.id;
            if (!productSales[productId]) {
              productSales[productId] = {
                title: item.title || item.name || 'Produit',
                quantity: 0,
                revenue: 0
              };
            }
            productSales[productId].quantity += item.quantity || 1;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get newsletter subscribers count
      const { count: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get recent orders for chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('total, created_at, payment_status')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Group by date for chart
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = recentOrders?.filter(o => 
          o.created_at.split('T')[0] === dateStr && o.payment_status === 'paid'
        ) || [];
        return {
          date: formatDateShort(date),
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          orders: dayOrders.length,
        };
      });

      // Order status distribution
      const statusDistribution = orders?.reduce((acc: any, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const statusChartData = Object.entries(statusDistribution || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts,
        lowStock,
        subscribers: subscribers || 0,
        conversionRate,
        chartData,
        topProducts,
        statusChartData,
        averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Export functions
  const exportToCSV = () => {
    if (!recentOrders || recentOrders.length === 0) {
      toast.error(t.common.noData);
      return;
    }

    const headers = [t.orders.orderNumber, t.orders.customer, t.common.email, t.common.total, t.common.status, t.common.date];
    const rows = recentOrders.map(order => [
      order.order_number,
      `${order.shipping_first_name} ${order.shipping_last_name || ''}`.trim(),
      order.shipping_email,
      order.total,
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(t.common.success);
  };

  const exportStats = () => {
    if (!stats) return;

    const data = {
      date: new Date().toISOString(),
      metrics: {
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        conversionRate: stats.conversionRate,
        averageOrderValue: stats.averageOrderValue,
        totalProducts: stats.totalProducts,
        subscribers: stats.subscribers
      },
      topProducts: stats.topProducts,
      chartData: stats.chartData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stats_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success(t.common.success);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t.orders.pending,
      confirmed: t.orders.confirmed,
      processing: t.orders.processing,
      shipped: t.orders.shipped,
      delivered: t.orders.delivered,
      cancelled: t.orders.cancelled,
      refunded: t.orders.refunded,
    };
    return labels[status] || status;
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t.common.export} CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportStats}>
            <Download className="h-4 w-4 mr-2" />
            {t.common.export} Stats
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalRevenue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalOrders}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders}</div>
            {stats?.pendingOrders ? (
              <p className="text-xs text-orange-500">{stats.pendingOrders} {t.orders.pending.toLowerCase()}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalProducts}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            {stats?.lowStock ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.lowStock} stock faible
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalCustomers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.subscribers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.revenueChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.orders.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.statusChartData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.statusChartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentOrders}</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recentOrders?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.orders.noOrders}</p>
          ) : (
            <div className="space-y-2">
              {recentOrders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_first_name} {order.shipping_last_name} • {formatDateShort(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatPrice(order.total)}</span>
                    <StatusBadge status={order.status || 'pending'} t={t} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  const getLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t.orders.pending,
      confirmed: t.orders.confirmed,
      processing: t.orders.processing,
      shipped: t.orders.shipped,
      delivered: t.orders.delivered,
      cancelled: t.orders.cancelled,
      refunded: t.orders.refunded,
    };
    return labels[status] || status;
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {getLabel(status)}
    </span>
  );
}
