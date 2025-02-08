// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import adminRoutes from "../views/admin router/admin.routes.js"; // Import admin-specific routes
import Home from "../views/Home.vue"; // Landing page
import Login from "../views/Login.vue"; // Login page
import UserProfile from "../views/UserProfile.vue";
import UserReservations from "@/views/UserReservations.vue";
import SignUp from "@/views/SignUp.vue"; // User profile page

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
        meta: { guestOnly: true }, // Prevent authenticated users from accessing login
    },
    {
        path: "/signup",
        name: "SignUp",
        component: SignUp,
        meta: { guestOnly: true }, // Prevent authenticated users from accessing login
    },
    {
        path: "/profile",
        name: "UserProfile",
        component: UserProfile,
        meta: { requiresAuth: true }, // User-only access
    },
    {
        path: "/reservations",
        name: "UserReservations",
        component: UserReservations,
        meta: { requiresAuth: true, role: "user" },
    },
    ...adminRoutes, // Use admin routes as defined in the separate file
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation Guard for Authentication and Roles
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token"); // Check for token
    const user = JSON.parse(localStorage.getItem("user")); // Parse user info from localStorage

    // Redirect authenticated users away from guest-only routes (e.g., Login)
    if (to.meta.guestOnly && token) {
        return next(user?.role === "admin" ? "/admin" : "/reservations"); // Redirect based on role
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
        // Redirect unauthenticated users to the login page
        if (!token) {
            return next({ path: "/login" });
        }

        // Restrict access based on role
        if (to.meta.role && user?.role !== to.meta.role) {
            alert("Access Denied: Insufficient Permissions");
            return next(false); // Prevent navigation
        }
    }

    // Allow access to all other routes
    next();
});

export default router;
