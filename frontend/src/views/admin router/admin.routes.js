// src/router/admin.routes.js

export default [
    {
        path: "/admin",
        name: "AdminDashboard",
        component: () => import("@/views/Admin.vue"), // Main dashboard layout
        children: [
            {
                path: "",
                name: "main",
                component: () => import("@/views/admin/AdminDashboard.vue"),
            },
            {
                path: "hotels",
                name: "ManageHotels",
                component: () => import("@/views/admin/HotelsView.vue"),
            },
            {
                path: "users",
                name: "ManageUsers",
                component: () => import("@/views/admin/UsersView.vue"),
            },
            {
                path: "reservations",
                name: "ManageReservations",
                component: () => import("@/views/admin/ReservationsView.vue"),
            },
        ],
    },
];
