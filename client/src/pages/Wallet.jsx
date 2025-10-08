import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  AccountBalanceWallet,
  CurrencyRupee,
  Add,
  TrendingUp,
  TrendingDown,
  Download,
  Receipt,
  CreditCard,
  AccountBalance,
  Phone,
  History,
  SwapHoriz,
  CheckCircle,
  Error,
  Pending,
  Payment,
  Refresh,
  Edit
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../services/api';

const Wallet = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addMoneyDialog, setAddMoneyDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [bankDetailsDialog, setBankDetailsDialog] = useState(false);
  
  // Form states
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  });
  const [upiId, setUpiId] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    loadWalletData();
    loadTransactions();
    loadPaymentStats();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await api.get('/api/payments/wallet');
      setWalletData(response.data);
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet error:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await api.get('/api/payments/transactions');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Transaction error:', err);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await api.get('/api/payments/stats');
      setPaymentStats(response.data);
    } catch (err) {
      console.error('Payment stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    try {
      if (!addAmount || parseFloat(addAmount) < 1) {
        showSnackbar('Please enter a valid amount (minimum ₹1)', 'error');
        return;
      }

      const response = await api.post('/api/payments/add-money', {
        amount: parseFloat(addAmount),
        method: paymentMethod
      });

      if (response.data.success) {
        // Open Razorpay payment gateway
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: response.data.order.amount,
          currency: 'INR',
          name: 'BudMatching',
          description: 'Add money to wallet',
          order_id: response.data.order.id,
          handler: async function (response) {
            try {
              await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              
              showSnackbar('Money added successfully!', 'success');
              loadWalletData();
              loadTransactions();
              setAddMoneyDialog(false);
              setAddAmount('');
            } catch (error) {
              showSnackbar('Payment verification failed', 'error');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: '#1976d2'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      showSnackbar('Failed to initiate payment', 'error');
      console.error('Add money error:', err);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
        showSnackbar('Minimum withdrawal amount is ₹100', 'error');
        return;
      }

      if (parseFloat(withdrawAmount) > walletData?.balance) {
        showSnackbar('Insufficient balance', 'error');
        return;
      }

      const response = await api.post('/api/payments/withdraw', {
        amount: parseFloat(withdrawAmount)
      });

      if (response.data.success) {
        showSnackbar('Withdrawal request submitted successfully!', 'success');
        loadWalletData();
        loadTransactions();
        setWithdrawDialog(false);
        setWithdrawAmount('');
      }
    } catch (err) {
      showSnackbar('Failed to submit withdrawal request', 'error');
      console.error('Withdrawal error:', err);
    }
  };

  const handleUpdateBankDetails = async () => {
    try {
      const response = await api.post('/api/payments/bank-details', bankDetails);
      
      if (response.data.success) {
        showSnackbar('Bank details updated successfully!', 'success');
        setBankDetailsDialog(false);
        loadWalletData();
      }
    } catch (err) {
      showSnackbar('Failed to update bank details', 'error');
      console.error('Bank details error:', err);
    }
  };

  const handleUpdateUPI = async () => {
    try {
      const response = await api.post('/api/payments/upi-details', { upiId });
      
      if (response.data.success) {
        showSnackbar('UPI details updated successfully!', 'success');
        loadWalletData();
      }
    } catch (err) {
      showSnackbar('Failed to update UPI details', 'error');
      console.error('UPI details error:', err);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return <TrendingUp color="success" />;
      case 'debit':
      case 'withdrawal':
        return <TrendingDown color="error" />;
      case 'promotion':
        return <CreditCard color="warning" />;
      default:
        return <SwapHoriz color="action" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle color="success" />;
      case 'failed':
      case 'error':
        return <Error color="error" />;
      case 'pending':
        return <Pending color="warning" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const WalletOverview = () => (
    <Grid container spacing={3}>
      {/* Wallet Balance Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Wallet Balance</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(walletData?.balance)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                startIcon={<Add />}
                onClick={() => setAddMoneyDialog(true)}
              >
                Add Money
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                startIcon={<Download />}
                onClick={() => setWithdrawDialog(true)}
                disabled={!walletData?.balance || walletData.balance < 100}
              >
                Withdraw
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(paymentStats?.thisMonth || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Spent
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(paymentStats?.totalSpent || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Earned
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(paymentStats?.totalEarned || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(paymentStats?.pending || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Payment Methods */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Payment Methods</Typography>
              <Button 
                size="small" 
                startIcon={<Edit />}
                onClick={() => setBankDetailsDialog(true)}
              >
                Update Details
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2">Bank Account</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {walletData?.bankDetails?.accountNumber ? 
                        `****${walletData.bankDetails.accountNumber.slice(-4)}` : 
                        'Not added'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Phone sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="subtitle2">UPI ID</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {walletData?.upiId || 'Not added'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const TransactionHistory = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Transaction History</Typography>
          <Button startIcon={<Refresh />} onClick={loadTransactions}>
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction, index) => (
                <TableRow key={transaction._id || index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTransactionIcon(transaction.type)}
                      <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {transaction.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.description || transaction.purpose || 'Transaction'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(transaction.status)}
                      <Chip 
                        label={transaction.status} 
                        size="small" 
                        sx={{ ml: 1, textTransform: 'capitalize' }}
                        color={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'failed' ? 'error' : 'warning'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Receipt />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet & Payments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Overview" icon={<AccountBalanceWallet />} />
          <Tab label="Transactions" icon={<History />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && <WalletOverview />}
      {activeTab === 1 && <TransactionHistory />}

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialog} onClose={() => setAddMoneyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 3, mt: 1 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="card">Debit/Credit Card</MenuItem>
              <MenuItem value="netbanking">Net Banking</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMoneyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMoney} variant="contained">
            Add Money
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Money</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Minimum withdrawal amount is ₹100. Money will be transferred to your bank account within 1-3 business days.
          </Alert>
          
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            inputProps={{ min: 100, max: walletData?.balance }}
            helperText={`Available balance: ${formatCurrency(walletData?.balance)}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="contained">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Details Dialog */}
      <Dialog open={bankDetailsDialog} onClose={() => setBankDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Payment Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Bank Account Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Holder Name"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            UPI Details
          </Typography>
          
          <TextField
            fullWidth
            label="UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@paytm"
            helperText="Enter your UPI ID for faster transactions"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDetailsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUPI} disabled={!upiId}>
            Update UPI
          </Button>
          <Button onClick={handleUpdateBankDetails} variant="contained">
            Update Bank Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Wallet;
