import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext'; // CHANGE THIS - use AuthContext
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import StatsBar from '../components/StatsBar';
import UpcomingStrip from '../components/UpcomingStrip';

const API_URL = 'http://localhost:5000/api';

export default function HomeScreen({ navigateTo }) { 
  const { user, logout } = useAuth(); // CHANGE THIS - use logout from AuthContext
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDone, setFilterDone] = useState('all');
  const [sort, setSort] = useState('newest');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState('light'); // ADD theme state

  const colors = theme === 'light' ? lightColors : darkColors;

  useEffect(() => {
  if (user) {
    fetchTasks();
  }
}, [user]);

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchTasks = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/tasks`, { headers });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (taskData) => {
    try {
      const headers = await getAuthHeader();
      let response;
      
      if (taskData.id || taskData._id) {
        const taskId = taskData.id || taskData._id;
        response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(taskData),
        });
      } else {
        response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers,
          body: JSON.stringify(taskData),
        });
      }
      
      const savedTask = await response.json();
      
      if (taskData.id || taskData._id) {
        setTasks(prev => prev.map(t => (t._id === (taskData.id || taskData._id)) ? savedTask : t));
      } else {
        setTasks(prev => [savedTask, ...prev]);
      }
      
      setModalVisible(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers,
      });
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeader();
              await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers,
              });
              setTasks(prev => prev.filter(t => t._id !== taskId));
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const clearAllTasks = () => {
    Alert.alert(
      'Clear All Reminders',
      'This will delete all your reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeader();
              await fetch(`${API_URL}/tasks`, { method: 'DELETE', headers });
              setTasks([]);
              Alert.alert('Success', 'All reminders cleared');
            } catch (error) {
              console.error('Error clearing tasks:', error);
              Alert.alert('Error', 'Failed to clear tasks');
            }
          },
        },
      ]
    );
  };

const handleSignOut = async () => {
  Alert.alert(
    'Sign Out',
    'Are you sure you want to sign out?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            await logout();
            navigateTo('login');
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
      },
    ]
  );
};
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks;
    
    if (search) {
      filtered = filtered.filter(t => 
        t.text?.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    if (filterDone !== 'all') {
      filtered = filtered.filter(t => filterDone === 'done' ? t.done : !t.done);
    }
    
    filtered.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
    
    return filtered;
  };

  // Calculate stats for profile menu
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const filteredTasks = getFilteredAndSortedTasks();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🔔 Reminders</Text>
          <Text style={[styles.headerGreeting, { color: colors.muted }]}>Hi, {user.name?.split(' ')[0] || user.name} 👋</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={[styles.iconButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Text>{theme === 'light' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowProfileMenu(!showProfileMenu)}
              style={[styles.avatarButton, { backgroundColor: colors.accentLight, borderColor: colors.border }]}
            >
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <>
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={() => setShowProfileMenu(false)}
          />
          <View style={[styles.profileMenu, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.text }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.profileAvatarText, { color: colors.accent }]}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.profileEmail, { color: colors.muted }]}>{user.email}</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statsSection}>
              <Text style={[styles.statsTitle, { color: colors.muted }]}>My Stats</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{totalTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>Reminders</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{completedTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{completionRate}%</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>Rate</Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>🚪 Sign Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatsBar tasks={tasks} colors={colors} />
        <UpcomingStrip tasks={tasks} colors={colors} />

        <View style={styles.searchSection}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="🔍 Search your reminders..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              setEditingTask(null);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <FilterButton 
            label="Priority" 
            value={filterPriority}
            onChange={setFilterPriority}
            options={['all', 'low', 'medium', 'high']}
            colors={colors}
          />
          <FilterButton 
            label="Category" 
            value={filterCategory}
            onChange={setFilterCategory}
            options={['all', 'Personal', 'Work', 'Health', 'Shopping', 'Finance', 'Other']}
            colors={colors}
          />
          <FilterButton 
            label="Status" 
            value={filterDone}
            onChange={setFilterDone}
            options={['all', 'pending', 'done']}
            colors={colors}
          />
          <FilterButton 
            label="Sort" 
            value={sort}
            onChange={setSort}
            options={['newest', 'oldest', 'priority']}
            colors={colors}
          />
        </ScrollView>

        {tasks.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllTasks}
            style={[styles.clearButton, { backgroundColor: '#FFF0F0', borderColor: '#FFC5C5' }]}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {tasks.length ? 'No matches found' : 'No reminders yet'}
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>
              {tasks.length ? 'Try adjusting your filters' : 'Tap + Add to create your first reminder'}
            </Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={toggleTask}
              onEdit={(task) => {
                setEditingTask(task);
                setModalVisible(true);
              }}
              onDelete={deleteTask}
              colors={colors}
            />
          ))
        )}
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        task={editingTask}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={saveTask}
        colors={colors}
      />
    </View>
  );
}

const FilterButton = ({ label, value, onChange, options, colors }) => (
  <TouchableOpacity 
    style={[styles.filterButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
    onPress={() => {
      const currentIndex = options.indexOf(value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex]);
    }}
  >
    <Text style={[styles.filterText, { color: colors.text }]}>
      {label}: {value === 'all' ? 'All' : value}
    </Text>
  </TouchableOpacity>
);

const lightColors = {
  bg: '#F5F4FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EFFE',
  text: '#1A1730',
  muted: '#7B7499',
  border: '#E2DEFF',
  accent: '#6C4EF6',
  accentLight: '#EBE6FF',
  accentDark: '#4A2FD4',
};

const darkColors = {
  bg: '#0F0D1A',
  surface: '#1A1730',
  surfaceAlt: '#221E3A',
  text: '#EDE9FF',
  muted: '#8B84AA',
  border: '#2D2850',
  accent: '#8B72FF',
  accentLight: '#2A2445',
  accentDark: '#A890FF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerGreeting: {
    fontSize: 13,
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 89,
  },
  profileMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 90,
    borderRadius: 14,
    padding: 16,
    width: 260,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statsSection: {
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  signOutButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    marginTop: 4,
  },
  signOutText: {
    color: '#E53E3E',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    borderWidth: 1,
  },
  addButton: {
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
  },
  clearButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButtonText: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
  },
});