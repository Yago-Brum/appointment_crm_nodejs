import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import './Dashboard.css';

const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [userStats, setUserStats] = useState({
    completedAppointments: 0,
    upcomingAppointments: 0,
    customerGrowth: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch customers data with proper pagination handling
        const customersResponse = await axiosInstance.get('/clients/');
        const allCustomers = customersResponse.data.results || customersResponse.data;
        setTotalCustomers(allCustomers.length);

        // Fetch appointments data with proper date handling
        const appointmentsResponse = await axiosInstance.get('/appointments/');
        const appointments = appointmentsResponse.data.results || [];
        
        // Get clients data and create a map for client names
        const clientsResponse = await axiosInstance.get('/clients/');
        const clientsData = clientsResponse.data || [];
        const clientsMap = {};
        clientsData.forEach((client) => {
          clientsMap[client.id] = client;
        });

        // Add client names to appointments
        const appointmentsWithClientNames = appointments.map((appointment) => ({
          ...appointment,
          clientName: clientsMap[appointment.client] ? clientsMap[appointment.client].name : 'Unknown',
        }));
        
        // Get today's date in the correct timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate today's appointments
        const todayAppointments = appointmentsWithClientNames.filter((appointment) => {
          const appointmentDate = new Date(appointment.date_hour);
          return appointmentDate >= today && appointmentDate < tomorrow;
        });
        setAppointmentsToday(todayAppointments.length);

        // Get recent customers (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentCustomersList = allCustomers.filter(customer => 
          new Date(customer.created_at) > oneWeekAgo
        );
        setRecentCustomers(recentCustomersList.slice(0, 4));

        // Get upcoming appointments
        const upcoming = appointmentsWithClientNames.filter(
          (appointment) => new Date(appointment.date_hour) > new Date()
        );
        setUpcomingAppointments(upcoming);

        // Calculate user statistics
        const completedAppointments = appointmentsWithClientNames.filter(
          (appointment) => new Date(appointment.date_hour) < new Date()
        ).length;

        // Calculate customer growth (comparing current month with previous month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthCustomers = allCustomers.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate.getMonth() === currentMonth && 
                 customerDate.getFullYear() === currentYear;
        }).length;

        const previousMonthCustomers = allCustomers.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate.getMonth() === previousMonth && 
                 customerDate.getFullYear() === previousYear;
        }).length;

        const customerGrowth = previousMonthCustomers === 0 ? 100 :
          ((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100;

        setUserStats({
          completedAppointments,
          upcomingAppointments: upcoming.length,
          customerGrowth: Math.round(customerGrowth)
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Customers</h3>
          <p>{totalCustomers.toLocaleString()}</p>
          <span>{userStats.customerGrowth >= 0 ? '+' : ''}{userStats.customerGrowth}% from last month</span>
        </div>
        <div className="summary-card">
          <h3>Appointments Today</h3>
          <p>{appointmentsToday.toLocaleString()}</p>
          <span>{userStats.completedAppointments} completed, {userStats.upcomingAppointments} upcoming</span>
        </div>
      </div>
      <div className="dashboard-details">
        <div className="upcoming-appointments">
          <h3>Upcoming Appointments</h3>
          <ul>
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <li key={appointment.id}>
                <div>
                  <p className="client-name"><strong>Client:</strong> {appointment.clientName}</p>
                  <span><strong>Description:</strong> {appointment.description}</span>
                </div>
                <div>
                  <span>
                    {new Date(appointment.date_hour).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(appointment.date_hour).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="recent-customers">
          <h3>Recent Customers</h3>
          <p>New customers from the past week</p>
          <ul>
            {recentCustomers.map((customer) => (
              <li key={customer.id}>
                <p>{customer.name}</p>
                <span>Added {Math.floor((new Date() - new Date(customer.created_at)) / (1000 * 60 * 60 * 24))} days ago</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
