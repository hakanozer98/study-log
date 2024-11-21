import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import IconSelector from '@/src/components/IconSelector';
import ColorPicker from '@/src/components/ColorPicker';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { FontAwesome } from '@expo/vector-icons';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [errors, setErrors] = useState({
    categoryName: '',
    icon: '',
    color: ''
  });
  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const handleCategoryNameChange = (text: string) => {
    setCategoryName(text);
    if (errors.categoryName) {
      setErrors(prev => ({ ...prev, categoryName: '' }));
    }
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: '' }));
    }
    setIconModalVisible(false);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
    setIsColorPickerVisible(false);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      categoryName: '',
      icon: '',
      color: ''
    };

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
      isValid = false;
    }

    if (!selectedIcon) {
      newErrors.icon = 'Please select an icon';
      isValid = false;
    }

    if (!selectedColor) {
      newErrors.color = 'Please select a color';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateCategory = async () => {
    if (!validateForm()) {
      return;
    }

    const { data, error } = await supabase
      .from('category')
      .insert([
        {
          name: categoryName,
          icon_name: selectedIcon,
          color: selectedColor,
        },
      ]);

    if (error) {
      alert('Error creating category');
      console.log('error', error);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add New Category</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.categoryName && styles.inputError]}
            value={categoryName}
            onChangeText={handleCategoryNameChange}
            placeholder="Enter category name"
          />
          {errors.categoryName ? (
            <Text style={styles.errorText}>{errors.categoryName}</Text>
          ) : null}
        </View>

        <View style={styles.cardContainer}>
          <Pressable 
            style={styles.card}
            onPress={() => setIconModalVisible(true)}
          >
            <Text style={styles.cardLabel}>Icon</Text>
            {selectedIcon ? (
              <FontAwesome name={selectedIcon as any} size={32} color={colors.onPrimaryContainer} />
            ) : (
              <Text style={styles.placeholderText}>Select an icon</Text>
            )}
            {errors.icon ? (
              <Text style={styles.errorText}>{errors.icon}</Text>
            ) : null}
          </Pressable>

          <Pressable 
            style={styles.card}
            onPress={() => setIsColorPickerVisible(true)}
          >
            <Text style={styles.cardLabel}>Color</Text>
            {selectedColor ? (
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
            ) : (
              <Text style={styles.placeholderText}>Select a color</Text>
            )}
            {errors.color ? (
              <Text style={styles.errorText}>{errors.color}</Text>
            ) : null}
          </Pressable>
        </View>

        <IconSelector
          visible={iconModalVisible}
          onClose={() => setIconModalVisible(false)}
          selectedIcon={selectedIcon}
          onSelectIcon={handleIconSelect}
        />

        <ColorPicker
          selectedColor={selectedColor}
          onSelectColor={handleColorSelect}
          isVisible={isColorPickerVisible}
          onClose={() => setIsColorPickerVisible(false)}
        />

        <Pressable
          style={styles.button}
          onPress={handleCreateCategory}
        >
          <Text style={styles.buttonText}>Create Category</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.onBackground,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.onBackground,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.onBackground,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginVertical: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 16,
    color: colors.onPrimaryContainer,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: colors.onPrimaryContainer,
    opacity: 0.7,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
});

export default AddCategory;