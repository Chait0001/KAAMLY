import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../store/AuthContext';
import { useLocation, UserLocation } from '../../store/LocationContext';
import { shopsApi } from '../../api/shops';
import { theme } from '../../theme';

export default function CustomerHomeScreen() {
  const { user, logout } = useAuth();
  const { location, setLocation, requestCurrentLocation } = useLocation();
  const router = useRouter();

  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('nearest');
  
  const [showLocationPicker, setShowLocationPicker] = useState(!location);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (location) {
      setShowLocationPicker(false);
      fetchShops();
    } else {
      setShowLocationPicker(true);
    }
  }, [location, sort]);

  const fetchShops = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const res = await shopsApi.getShops({
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        sort,
      });
      setShops(res.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching shops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  // Debounced search for locations
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await shopsApi.searchLocations(searchQuery);
        setSearchResults(res.data);
      } catch (e) {
        console.error(e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectCityArea = (city: string, area: string) => {
    setLocation({
      label: `${area}, ${city}`,
      city,
    });
  };

  const renderLocationPicker = () => (
    <Modal visible={showLocationPicker} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Select Location</Text>
        
        <TouchableOpacity style={styles.currentLocBtn} onPress={requestCurrentLocation}>
          <Text style={styles.currentLocText}>📍 Use my current location</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search city or area..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={searchResults}
          keyExtractor={(item, idx) => `${item.city}-${item.area}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultItem} onPress={() => selectCityArea(item.city, item.area)}>
              <Text style={styles.searchResultText}>{item.area}, {item.city}</Text>
            </TouchableOpacity>
          )}
        />
        {location && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLocationPicker(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>Location</Text>
        <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
          <Text style={styles.locationValue} numberOfLines={1}>{location?.label || 'Select location'} ▼</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSortChips = () => (
    <View style={styles.chipsContainer}>
      {['nearest', 'rating', 'available'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[styles.chip, sort === type && styles.chipActive]}
          onPress={() => setSort(type)}
        >
          <Text style={[styles.chipText, sort === type && styles.chipTextActive]}>
            {type === 'nearest' ? 'Nearest' : type === 'rating' ? 'Top Rated' : 'Most Available'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderShop = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.shopCard}
      onPress={() => router.push(`/(customer)/shop/${item.id}`)}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: item.is_open_now ? theme.colors.success : theme.colors.error }]}>
          <Text style={styles.badgeText}>{item.is_open_now ? 'Open Now' : 'Closed'}</Text>
        </View>
      </View>
      <Text style={styles.shopArea}>{item.area}, {item.city}</Text>
      
      <View style={styles.shopDetails}>
        <Text style={styles.shopRating}>⭐ {item.rating} ({item.total_reviews})</Text>
        {item.distance_km != null && (
          <Text style={styles.shopDistance}> • {parseFloat(item.distance_km).toFixed(1)} km</Text>
        )}
      </View>
      <Text style={styles.mechanicCount}>
        🛠️ {item.available_mechanic_count} / {item.mechanic_count} Mechanics Available
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderLocationPicker()}
      {renderHeader()}
      {renderSortChips()}
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchShops}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={item => item.id.toString()}
          renderItem={renderShop}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No shops found matching your criteria.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 50, // rough safe area
  },
  locationContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  locationLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  logoutBtn: {
    justifyContent: 'center',
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.card,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  shopCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shopArea: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  shopDetails: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  shopRating: {
    fontSize: 14,
    fontWeight: '500',
  },
  shopDistance: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  mechanicCount: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  loader: {
    marginTop: 50,
  },
  centerBox: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10,
  },
  retryBtn: {
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  retryBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  currentLocBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  currentLocText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 10,
    backgroundColor: theme.colors.card,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchResultText: {
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.error,
    fontSize: 16,
  }
});
