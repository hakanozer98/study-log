import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import IconSelector from '@/src/components/IconSelector';
import ColorPicker from '@/src/components/ColorPicker';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState(''); // Changed initial value to empty string
  const [errors, setErrors] = useState({
    categoryName: '',
    icon: '',
    color: ''
  });

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
            onChangeText={setCategoryName}
            placeholder="Enter category name"
          />
          {errors.categoryName ? (
            <Text style={styles.errorText}>{errors.categoryName}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Icon</Text>
          {errors.icon ? (
            <Text style={styles.errorText}>{errors.icon}</Text>
          ) : null}
          <IconSelector 
            selectedIcon={selectedIcon} 
            onSelectIcon={setSelectedIcon} 
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Color</Text>
          {errors.color ? (
            <Text style={styles.errorText}>{errors.color}</Text>
          ) : null}
          <ColorPicker 
            selectedColor={selectedColor} 
            onSelectColor={setSelectedColor} 
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleCreateCategory}
        >
          <Text style={styles.buttonText}>Create Category</Text>
        </TouchableOpacity>
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
});

export default AddCategory;