import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Category } from '@/src/types/database'
import { supabase } from '@/src/lib/supabase'
import { colors } from '@/src/theme/colors'
import { router, useFocusEffect } from 'expo-router'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'

const isColorLight = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
};

const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const adjustComponent = (c: number) => {
        const newC = c + amount;
        return Math.min(255, Math.max(0, newC));
    };

    const rr = adjustComponent(r).toString(16).padStart(2, '0');
    const gg = adjustComponent(g).toString(16).padStart(2, '0');
    const bb = adjustComponent(b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
};

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([])

    useFocusEffect(() => {
        const fetchCategories = async () => {
            let { data: category, error } = await supabase
                .from('category')
                .select('*')
            if (error) console.log('error', error)
            else if (category) setCategories(category)
        }
        fetchCategories()
    })

    const deleteCategory = async (id: string) => {
        const { error } = await supabase
            .from('category')
            .delete()
            .eq('id', id)
    }

    const handleCategorySelect = (category: Category) => {
        if (router.canGoBack()) {
            router.navigate({pathname: '/(root)/(tabs)/timer', params: {categoryId: category.id}})
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerText}>Categories</Text>
                    <Pressable
                        onPress={() => router.navigate('/add-category')}
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed
                        ]}>
                        <Text style={styles.addButtonText}>Add Category</Text>
                    </Pressable>
                </View>
            </View>
            <FlatList
                contentContainerStyle={styles.listContainer}
                data={categories}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handleCategorySelect(item)}
                        style={({ pressed }) => [
                            styles.categoryItem,
                            pressed && styles.categoryItemPressed
                        ]}>
                        <View style={styles.leftContent}>
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                <FontAwesome 
                                    name={item.icon_name as any} 
                                    size={18} 
                                    color={isColorLight(item.color) ? 
                                        adjustColor(item.color, -40) : 
                                        adjustColor(item.color, 100)
                                    } 
                                />
                            </View>
                            <Text style={styles.categoryName}>{item.name}</Text>
                        </View>
                        <Pressable
                            onPress={() => deleteCategory(item.id)}
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.deleteButtonPressed
                            ]}>
                            <MaterialIcons name="delete" size={24} color={colors.error} />
                        </Pressable>
                    </Pressable>
                )}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        width: '100%',
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.onBackground,
        flex: 1,  // This allows the text to take available space while respecting the button
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: colors.primaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,  // Add some space between text and button
    },
    addButtonPressed: {
        opacity: 0.8,
    },
    addButtonText: {
        color: colors.onPrimaryContainer,
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
    },
    categoryItem: {
        backgroundColor: colors.surfaceVariant,
        padding: 20,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 18,
        color: colors.onSurfaceVariant,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 20,
    },
    deleteButtonPressed: {
        backgroundColor: colors.errorContainer,
    },
    categoryItemPressed: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Categories