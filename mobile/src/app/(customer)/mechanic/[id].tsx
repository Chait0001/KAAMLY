import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shopsApi } from '../../../api/shops';
import { theme } from '../../../theme';

export default function MechanicScreen() {
  const { id, shopId } = useLocalSearchParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopAndMechanic = async () => {
      if (!shopId) {
        setError('Shop ID missing');
        setLoading(false);
        return;
      }
      try {
        const res = await shopsApi.getShopDetails(shopId as string);
        const mechanic = res.mechanics.find((m: any) => m.id.toString() === id);
        if (!mechanic) {
          setError('Mechanic not found in this shop');
          return;
        }
        setData({ mechanic, services: res.services, shop: res.shop });
      } catch (err: any) {
        setError(err.message || 'Error fetching mechanic details');
      } finally {
        setLoading(false);
      }
    };
    fetchShopAndMechanic();
  }, [id, shopId]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />;
  }

  if (error || !data) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error || 'Mechanic not found'}</Text>
      </View>
    );
  }

  const { mechanic, services, shop } = data;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back to {shop.name}</Text>
          </TouchableOpacity>
          <View style={styles.mechanicProfile}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{mechanic.name.charAt(0)}</Text>
            </View>
            <View style={styles.mechanicInfo}>
              <Text style={styles.mechanicName}>{mechanic.name}</Text>
              <Text style={styles.mechanicSpecialisation}>{mechanic.specialisation}</Text>
              <Text style={styles.mechanicStats}>⭐ {mechanic.rating} ({mechanic.total_reviews} reviews)</Text>
              <Text style={styles.mechanicStats}>{mechanic.experience_yrs} yrs experience</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Services</Text>
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

      <View style={styles.footer}>
        <View style={styles.visitChargeRow}>
          <Text style={styles.visitChargeLabel}>Visit Charge</Text>
          <Text style={styles.visitChargeValue}>₹{mechanic.visit_charge}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} disabled={true}>
          <Text style={styles.bookBtnText}>Booking coming soon</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flex: 1,
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
  mechanicProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  mechanicSpecialisation: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  mechanicStats: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  visitChargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  visitChargeLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  visitChargeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  bookBtn: {
    backgroundColor: theme.colors.border, // Disabled look
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  bookBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
