import { ref, computed } from 'vue';

export interface UserData {
    id?: number;
    role?: 'admin' | 'user' | string;
    email?: string;
}

export const useUserStore = () => {
    const user = ref<UserData | null>(
        JSON.parse(localStorage.getItem('user') || 'null')
    );

    const token = ref(localStorage.getItem('token') || null);
    const userUpdated = ref(0);

    const login = (userData: UserData, accessToken: string) => {
        user.value = userData;
        token.value = accessToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', accessToken);
        userUpdated.value++;
    };

    const signup = (userData: UserData, accessToken: string) => {
        user.value = userData;
        token.value = accessToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', accessToken);
        userUpdated.value++;
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        userUpdated.value++;
    };

    const links = computed(() => {
        userUpdated.value;
        const baseLinks = [{ text: 'Home', to: '/', variant: 'text' }];

        if (user.value?.role === 'admin') {
            baseLinks.push({
                text: 'Admin Dashboard',
                to: '/admin',
                variant: 'text'
            });
        } else if (user.value?.role === 'user') {
            baseLinks.push({
                text: 'My Reservations',
                to: '/reservations',
                variant: 'text'
            });
        }

        if (!user.value) {
            baseLinks.push({
                text: 'Login',
                to: '/login',
                variant: 'text'
            });
            baseLinks.push({
                text: 'Sign Up',
                to: '/signup',
                variant: 'text'
            });
        }

        return baseLinks;
    });

    return {
        user,
        token,
        links,
        login,
        signup,
        logout,
        isLoggedIn: computed(() => !!user.value)
    };
};

export const userStore = useUserStore();
