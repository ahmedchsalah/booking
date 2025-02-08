<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Line, Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  BarElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement,
    BarElement,
    ArcElement
);

const counts = ref({
  hotels: 0,
  users: 0,
  reservations: 0,
});

const analytics = ref(null);
const error = ref("");

const monthlyRevenueData = ref({
  labels: [],
  datasets: [{
    label: 'Monthly Revenue ($)',
    data: [],
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    tension: 0.4,
    fill: true
  }]
});

const topHotelsData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: ['#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#3F51B5']
  }]
});

const monthlyBookingsData = ref({
  labels: [],
  datasets: [{
    label: 'Number of Bookings',
    data: [],
    backgroundColor: '#4CAF50'
  }]
});

const fetchCounts = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const [hotelsResponse, usersResponse, reservationsResponse] = await Promise.all([
      axios.get("http://localhost:3000/hotels/count", config),
      axios.get("http://localhost:3000/users/count", config),
      axios.get("http://localhost:3000/reservations/admin/reservations-count", config),
    ]);

    counts.value.hotels = hotelsResponse.data.count;
    counts.value.users = usersResponse.data.count;
    counts.value.reservations = reservationsResponse.data.data.count;
  } catch (err) {
    error.value = "Failed to fetch dashboard data. Please try again.";
    console.error(err);
  }
};

const fetchAnalytics = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3000/reservations/admin/analytics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    analytics.value = response.data.data;
    updateChartData();
  } catch (err) {
    error.value = "Failed to fetch analytics data";
    console.error(err);
  }
};

const updateChartData = () => {
  if (!analytics.value) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  monthlyRevenueData.value = {
    labels: analytics.value.reservationAnalytics.monthlyRevenue.map(item => months[item.month - 1]),
    datasets: [{
      label: 'Monthly Revenue ($)',
      data: analytics.value.reservationAnalytics.monthlyRevenue.map(item => parseFloat(item.revenue)),
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  topHotelsData.value = {
    labels: analytics.value.hotelPerformance.topHotels.map(hotel => hotel.hotel_name),
    datasets: [{
      data: analytics.value.hotelPerformance.topHotels.map(hotel => parseInt(hotel.booking_count)),
      backgroundColor: ['#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#3F51B5']
    }]
  };

  monthlyBookingsData.value = {
    labels: analytics.value.reservationAnalytics.monthlyReservations.map(item => months[item.month - 1]),
    datasets: [{
      label: 'Number of Bookings',
      data: analytics.value.reservationAnalytics.monthlyReservations.map(item => parseInt(item.count)),
      backgroundColor: '#4CAF50'
    }]
  };
};

onMounted(() => {
  fetchCounts();
  fetchAnalytics();
});
</script>

<template>
  <div class="admin-dashboard">
    <v-container>
      <h1>Admin Dashboard</h1>
      <v-row>
        <v-col cols="12" md="4">
          <router-link to="/admin/hotels" class="link">
            <v-card class="dashboard-card">
              <v-card-title>
                <v-icon color="blue" class="dashboard-icon">mdi-domain</v-icon>
                <span>Hotels</span>
              </v-card-title>
              <v-card-subtitle>
                <strong>{{ counts.hotels }}</strong> hotels managed
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-col>

        <v-col cols="12" md="4">
          <router-link to="/admin/users" class="link">
            <v-card class="dashboard-card">
              <v-card-title>
                <v-icon color="green" class="dashboard-icon">mdi-account-group</v-icon>
                <span>Users</span>
              </v-card-title>
              <v-card-subtitle>
                <strong>{{ counts.users }}</strong> users registered
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-col>

        <v-col cols="12" md="4">
          <router-link to="/admin/reservations" class="link">
            <v-card class="dashboard-card">
              <v-card-title>
                <v-icon color="red" class="dashboard-icon">mdi-calendar-check</v-icon>
                <span>Reservations</span>
              </v-card-title>
              <v-card-subtitle>
                <strong>{{ counts.reservations }}</strong> reservations made
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col cols="12">
          <h2 class="text-h5 mb-4">Analytics Overview</h2>
        </v-col>

        <v-col cols="12">
          <v-card class="chart-card">
            <v-card-title class="chart-title">
              <v-icon color="primary" class="mr-2">mdi-chart-line</v-icon>
              Monthly Revenue
            </v-card-title>
            <v-card-text style="height: 400px">
              <Line
                  :data="monthlyRevenueData"
                  :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => `$${value}`
                      }
                    }
                  }
                }"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="chart-card">
            <v-card-title class="chart-title">
              <v-icon color="warning" class="mr-2">mdi-star</v-icon>
              Top Performing Hotels
            </v-card-title>
            <v-card-text style="height: 300px">
              <Doughnut
                  :data="topHotelsData"
                  :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="chart-card">
            <v-card-title class="chart-title">
              <v-icon color="success" class="mr-2">mdi-calendar-check</v-icon>
              Monthly Bookings
            </v-card-title>
            <v-card-text style="height: 300px">
              <Bar
                  :data="monthlyBookingsData"
                  :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="error" class="error-message">
        <v-alert type="error" prominent>
          {{ error }}
        </v-alert>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.dashboard-card {
  text-align: center;
  padding: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
}

.dashboard-icon {
  font-size: 36px;
  margin-right: 8px;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #424242;
}

.error-message {
  margin-top: 16px;
  text-align: center;
}

.link {
  text-decoration: none;
  color: inherit;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.chart-title {
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}

:deep(.v-card-text) {
  padding: 24px;
}
</style>
