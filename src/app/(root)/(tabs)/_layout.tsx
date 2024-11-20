import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { colors } from '@/src/theme/colors';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.onSurfaceDisabled,
                tabBarStyle: {
                    backgroundColor: colors.primaryContainer,
                    borderTopWidth: 0,
                    shadowColor: 'transparent',
                    elevation: 0,
                },
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name='timer'
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color }) => <FontAwesome6 name='stopwatch' color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name='logs'
                options={{
                    title: 'Logs',
                    tabBarIcon: ({ color }) => <FontAwesome name='list' color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <FontAwesome name='user' color={color} size={24} />
                }}
            />
        </Tabs>
    )
}

export default TabsLayout