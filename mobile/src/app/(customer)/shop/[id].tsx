import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shopsApi } from '../../../api/shops';
import { theme } from '../../../theme';

export default function ShopScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await shopsApi.getShopDetails(id as string);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Error fetching shop details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />;
  }

  if (error || !data) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error || 'Shop not found'}</Text>
      </View>
    );
  }

  const { shop, mechanics, services } = data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopLocation}>{shop.area}, {shop.city}</Text>
          <Text style={styles.shopRating}>⭐ {shop.rating} ({shop.total_reviews} reviews)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mechanics</Text>
        {mechanics.map((mechanic: any) => (
          <TouchableOpacity 
            key={mechanic.id} 
            style={styles.mechanicCard}
            onPress={() => router.push(`/(customer)/mechanic/${mechanic.id}?shopId=${shop.id}`)}
          >
            <View style={styles.mechanicHeader}>
              <Text style={styles.mechanicName}>{mechanic.name}</Text>
              <View style={[styles.badge, { backgroundColor: mechanic.is_available ? theme.colors.success : theme.colors.textSecondary }]}>
                <Text style={styles.badgeText}>{mechanic.is_available ? 'Available' : 'Busy'}</Text>
              </View>
            </View>
            <Text style={styles.mechanicDetails}>
              {mechanic.specialisation} • {mechanic.experience_yrs} yrs exp
            </Text>
            <Text style={styles.mechanicRating}>⭐ {mechanic.rating} | Visit Charge: ₹{mechanic.visit_charge}</Text>
          </TouchableOpacity>
        ))}
        {mechanics.length === 0 && <Text style={styles.emptyText}>No mechanics available here.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        {services.map((service: any) => (
          <View key={service.shop_service_id} style={styles.serviceItem}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              {service.description ? <Text style={styles.serviceDesc}>{service.description}</Text> : null}
            </View>
            <Text style={styles.servicePrice}>₹{service.price}</Text>
          </View>
        ))}
        {services.length === 0 && <Text style={styles.emptyText}>No services listed.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  shopLocation: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  shopRating: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 4,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  mechanicCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  mechanicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  mechanicDetails: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  mechanicRating: {
    marginTop: 8,
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  serviceDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  }
});
