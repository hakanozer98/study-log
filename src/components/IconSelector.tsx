import React from 'react';
import { View, Pressable, StyleSheet, Modal, Dimensions, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { colors } from '../theme/colors';
import { icons } from '../consts/icons';

interface IconSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const NUM_COLUMNS = 4;

const IconSelector = ({ visible, onClose, selectedIcon, onSelectIcon }: IconSelectorProps) => {
  const renderIcon = ({ item }: { item: string }) => (
    <Pressable
      key={item}
      style={[
        styles.iconButton,
        selectedIcon === item && styles.selectedIcon
      ]}
      onPress={() => onSelectIcon(item)}
    >
      <FontAwesome
        name={item as any}
        size={20}
        color={selectedIcon === item ? '#fff' : '#000'}
      />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Select Icon</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="close" size={20} color={colors.onSurface} />
            </Pressable>
          </View>
          <FlashList
            data={icons}
            renderItem={renderIcon}
            estimatedItemSize={50}
            numColumns={NUM_COLUMNS}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            extraData={selectedIcon}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: 400,
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    padding: 0,
  },
  listContent: {
    padding: 16,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    margin: 8,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
  },
  closeButton: {
    padding: 4,
  },
});

export default IconSelector;