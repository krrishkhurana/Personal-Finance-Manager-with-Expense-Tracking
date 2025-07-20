import { useState, useEffect } from 'react';
import { transactionService } from '../services/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getAll();
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await transactionService.create(transactionData);
      setTransactions(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to add transaction' 
      };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await transactionService.update(id, transactionData);
      setTransactions(prev => 
        prev.map(t => t._id === id ? response.data : t)
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update transaction' 
      };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete transaction' 
      };
    }
  };

  const getStatistics = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      transactionCount: transactions.length
    };
  };

  const getRecentTransactions = (count = 5) => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  };

  const getTransactionsByCategory = () => {
    const categories = {};
    transactions.forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          income: 0,
          expense: 0,
          total: 0
        };
      }
      
      categories[transaction.category][transaction.type] += transaction.amount;
      categories[transaction.category].total += 
        transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });
    
    return categories;
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStatistics,
    getRecentTransactions,
    getTransactionsByCategory
  };
};
