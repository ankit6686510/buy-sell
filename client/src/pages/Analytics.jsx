import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  useTheme, // <-- Added for theme adaptation
  alpha,    // <-- Added for color opacity
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown, // <-- Added for downward trend
  Visibility,
  CurrencyRupee,
  People,
  Timeline,
  Assessment,
  Download,
  LocalOffer,
  AttachMoney, // Alternative for revenue
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';
import api from '../services/api';

// --- Recharts Color Palette (Theme-aware for better dark mode charts) ---
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']; 
const CHART_STROKE_COLOR_LIGHT = '#374151'; // A dark grey
const CHART_STROKE_COLOR_DARK = '#e5e7eb';  // A light grey

// --- Metric Card Component (Enhanced with useTheme and elevation) ---
const MetricCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
  const theme = useTheme();
  const isPositive = change > 0;
  const changeColor = isPositive ? theme.palette.success.main : theme.palette.error.main;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  
  // Custom color lookup based on theme palette
  const iconColor = theme.palette[color] ? theme.palette[color].main : theme.palette.primary.main;
  
  return (
    <Card 
      elevation={4} 
      sx={{ 
        height: '100%',
        borderRadius: '12px',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {change !== null && change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChangeIcon 
                  sx={{ 
                    fontSize: 18, 
                    color: changeColor,
                    mr: 0.5 
                  }} 
                />
                <Typography 
                  variant="body2" 
                  color={changeColor}
                  sx={{ fontWeight: 600 }}
                >
                  {isPositive ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: '50%',
              bgcolor: alpha(iconColor, 0.1), // Subtle background for the icon
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 30, color: iconColor }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};


// --- Main Analytics Component ---
const Analytics = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [userJourney, setUserJourney] = useState(null);

  const { user } = useSelector(state => state.auth);
  const chartStrokeColor = theme.palette.mode === 'dark' ? CHART_STROKE_COLOR_DARK : CHART_STROKE_COLOR_LIGHT;
  const gridStrokeColor = alpha(theme.palette.text.primary, 0.1);
  const tooltipBackground = theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.common.white, 0.95);
  const tooltipColor = theme.palette.text.primary;

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call for demonstration (replace with actual logic)
      const data = {
        // Mock API responses for a complete UI
        dashboardRes: {
          data: {
            revenue: { total: 154320, change: 12.5 },
            views: { total: 54020, change: -2.1 },
            listings: { active: 120, change: 5.0 },
            conversion: { rate: 2.8, change: 0.5 },
            revenueChart: Array.from({ length: 7 }, (_, i) => ({
              date: `Day ${i + 1}`, revenue: Math.floor(Math.random() * 50000) + 50000 
            })),
            topCategories: [
              { name: 'Category 1', value: 400 },
              { name: 'Category 2', value: 300 },
              { name: 'Category 3', value: 200 },
              { name: 'Category 4', value: 100 },
            ],
            recentActivity: Array.from({ length: 3 }, (_, i) => ({
              description: i === 0 ? 'New Featured Listing added' : `User viewed 5 listings`,
              timestamp: new Date(Date.now() - i * 86400000),
            })),
          }
        },
        funnelRes: {
          data: {
            steps: [
              { name: 'Viewed Search Results', users: 10000, conversionRate: 100 },
              { name: 'Viewed Listing Page', users: 7000, conversionRate: 70 },
              { name: 'Clicked Contact Seller', users: 3500, conversionRate: 50 },
              { name: 'Successful Lead', users: 2800, conversionRate: 80 },
            ],
            performance: Array.from({ length: 4 }, (_, i) => ({
              step: `Step ${i + 1}`, users: [10000, 7000, 3500, 2800][i]
            })),
            dropoff: Array.from({ length: 3 }, (_, i) => ({
              step: `Dropoff ${i + 1}`, dropoffRate: [30, 50, 20][i]
            })),
          }
        },
        journeyRes: {
          data: {
            journeySteps: [
              { name: 'Search', description: 'User enters search query', users: 10000, avgTime: '10s', completionRate: 70 },
              { name: 'Filter/Sort', description: 'User refines results', users: 7000, avgTime: '15s', completionRate: 85 },
              { name: 'View Listing', description: 'User clicks on a listing card', users: 5950, avgTime: '45s', completionRate: 50 },
              { name: 'Contact', description: 'User sends a message/calls', users: 2975, avgTime: '30s', completionRate: 90 },
            ]
          }
        }
      };
      
      // const [dashboardRes, funnelRes, journeyRes] = await Promise.all([
      //   api.get(`/api/analytics/dashboard?timeRange=${timeRange}`),
      //   api.get(`/api/analytics/funnel?timeRange=${timeRange}`),
      //   api.get(`/api/analytics/user-journey?timeRange=${timeRange}`)
      // ]);

      setDashboardData(data.dashboardRes.data);
      setFunnelData(data.funnelRes.data);
      setUserJourney(data.journeyRes.data);
    } catch (err) {
      setError('Failed to load analytics data. Please check the network.');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };
  
  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label, formatter = formatNumber, title = 'Value' }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={8} sx={{ p: 1, borderRadius: '8px', bgcolor: tooltipBackground, color: tooltipColor }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="body2" color="primary.main">
            {title}: {formatter(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // --- Tab Content Components ---
  const OverviewTab = () => (
    <Grid container spacing={4}> {/* Increased spacing for better look */}
      {/* Key Metrics */}
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(dashboardData?.revenue?.total)}
          change={dashboardData?.revenue?.change}
          icon={CurrencyRupee}
          color="success"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Views"
          value={formatNumber(dashboardData?.views?.total)}
          change={dashboardData?.views?.change}
          icon={Visibility}
          color="info"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Active Listings"
          value={formatNumber(dashboardData?.listings?.active)}
          change={dashboardData?.listings?.change}
          icon={LocalOffer}
          color="warning"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Conversion Rate"
          value={`${(dashboardData?.conversion?.rate || 0).toFixed(1)}%`}
          change={dashboardData?.conversion?.change}
          icon={Assessment}
          color="primary"
        />
      </Grid>

      {/* Revenue Chart */}
      <Grid item xs={12} md={8}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Revenue Trend ({timeRange})
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dashboardData?.revenueChart || []}>
                <CartesianGrid stroke={gridStrokeColor} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={chartStrokeColor} />
                <YAxis stroke={chartStrokeColor} tickFormatter={formatCurrency} />
                <Tooltip 
                  content={<CustomTooltip formatter={formatCurrency} title="Revenue" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme.palette.success.main}
                  fill={alpha(theme.palette.success.main, 0.3)}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Categories */}
      <Grid item xs={12} md={4}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Top Categories
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={dashboardData?.topCategories || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100} // Increased radius
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(dashboardData?.topCategories || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]} 
                      stroke={theme.palette.background.paper} // Separator color
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Recent Activity
            </Typography>
            {dashboardData?.recentActivity?.slice(0, 5).map((activity, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  py: 1.5,
                  borderBottom: index < (dashboardData?.recentActivity?.length || 0) - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                }}
              >
                <Timeline sx={{ color: theme.palette.primary.main, mr: 2 }} />
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  {activity.description}
                </Typography>
                <Chip 
                  size="small"
                  label={new Date(activity.timestamp).toLocaleDateString()}
                  icon={<CalendarToday sx={{ fontSize: 14 }} />}
                  variant="outlined"
                  sx={{ color: 'text.secondary', borderColor: 'divider' }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const FunnelTab = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Conversion Funnel Analysis
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {funnelData?.steps?.map((step, index) => {
                const percentage = step.conversionRate;
                const progressColor = percentage > 60 ? theme.palette.success.main : theme.palette.warning.main;
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', height: '100%' }}>
                      <Typography variant="body1" fontWeight={600} mb={0.5}>{step.name}</Typography>
                      <Typography variant="h5" color={progressColor} fontWeight={700}>
                        {formatNumber(step.users)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                        {percentage}% Conversion Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4, 
                          bgcolor: alpha(progressColor, 0.2), // Light background for dark mode
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progressColor,
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Step-by-Step User Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData?.performance || []}>
                <CartesianGrid stroke={gridStrokeColor} strokeDasharray="3 3" />
                <XAxis dataKey="step" stroke={chartStrokeColor} />
                <YAxis stroke={chartStrokeColor} tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip title="Users" />} />
                <Bar 
                  dataKey="users" 
                  fill={theme.palette.info.main}
                  radius={[4, 4, 0, 0]} // Rounded top corners
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Drop-off Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={funnelData?.dropoff || []}>
                <CartesianGrid stroke={gridStrokeColor} strokeDasharray="3 3" />
                <XAxis dataKey="step" stroke={chartStrokeColor} />
                <YAxis stroke={chartStrokeColor} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip formatter={(value) => `${value}%`} title="Drop-off" />} />
                <Area 
                  type="monotone" 
                  dataKey="dropoffRate" 
                  stroke={theme.palette.error.main}
                  fill={alpha(theme.palette.error.main, 0.3)}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const UserJourneyTab = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card elevation={4} sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              User Journey Map
            </Typography>
            <Box sx={{ mt: 3 }}>
              {userJourney?.journeySteps?.map((step, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    p: 2,
                    // Use theme divider for border
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    bgcolor: theme.palette.background.default, // Slightly different background
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {index + 1}. {step.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        size="small" 
                        label={`${formatNumber(step.users)} users`}
                        color="primary"
                        variant="filled"
                        sx={{ mr: 1, bgcolor: theme.palette.primary.main, color: 'white' }}
                      />
                      <Chip 
                        size="small" 
                        label={`${step.avgTime} avg time`}
                        variant="outlined"
                        icon={<Timeline sx={{ fontSize: 14 }} />}
                        sx={{ color: 'text.secondary', borderColor: theme.palette.divider }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right', minWidth: '100px' }}>
                    <Typography variant="h5" fontWeight={700} color={step.completionRate > 70 ? 'success.main' : 'warning.main'}>
                      {step.completionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completion Rate
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, background: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Performance Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            // Note: window.print() is simple, a proper report generation function would be better here
            onClick={() => alert('Download report functionality coming soon!')}
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={4} sx={{ mb: 4, borderRadius: '12px' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ '& .MuiTab-root': { py: 2, fontWeight: 600 } }}
        >
          <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
          <Tab label="Funnel Analysis" icon={<Timeline />} iconPosition="start" />
          <Tab label="User Journey" icon={<People />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <FunnelTab />}
        {activeTab === 2 && <UserJourneyTab />}
      </Box>
    </Box>
  );
};

export default Analytics;