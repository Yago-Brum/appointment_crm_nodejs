// src/components/Calendar/Calendar.js
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ onNavigate, onView, view, label }) => (
  <div className="rbc-toolbar">
    <div className="rbc-btn-group">
      <button type="button" onClick={() => onNavigate('PREV')} className="rbc-btn">
        <FaChevronLeft />
      </button>
      <button type="button" onClick={() => onNavigate('TODAY')} className="rbc-btn">
        Today
      </button>
      <button type="button" onClick={() => onNavigate('NEXT')} className="rbc-btn">
        <FaChevronRight />
      </button>
    </div>
    <div className="rbc-toolbar-label">{label}</div>
    <div className="rbc-btn-group">
      <button type="button" onClick={() => onView(Views.MONTH)} className={`rbc-btn ${view === Views.MONTH ? 'rbc-active' : ''}`}>
        Month
      </button>
      <button type="button" onClick={() => onView(Views.WEEK)} className={`rbc-btn ${view === Views.WEEK ? 'rbc-active' : ''}`}>
        Week
      </button>
      <button type="button" onClick={() => onView(Views.DAY)} className={`rbc-btn ${view === Views.DAY ? 'rbc-active' : ''}`}>
        Day
      </button>
    </div>
  </div>
);

const CalendarView = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        const appointmentsResponse = await axiosInstance.get('/appointments/');
        const appointmentsData = appointmentsResponse.data.results || [];

        const clientsResponse = await axiosInstance.get('/clients/');
        const clientsData = clientsResponse.data || [];

        const clientsMap = {};
        clientsData.forEach(client => {
          clientsMap[client.id] = client;
        });

        const calendarEvents = appointmentsData.map(appointment => ({
          id: appointment.id,
          title: `${clientsMap[appointment.client]?.name || 'Unknown Client'} - ${appointment.description || 'No description'}`,
          start: new Date(appointment.date_hour),
          end: new Date(new Date(appointment.date_hour).getTime() + 30 * 60000),
          allDay: false,
          appointmentData: {
            ...appointment,
            client_name: clientsMap[appointment.client]?.name || 'Unknown Client'
          }
        }));

        setAppointments(calendarEvents);
      } catch (error) {
        setError('Error loading appointments');
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleSelectEvent = (event) => {
    navigate('/appointments', { state: { editingAppointment: event.appointmentData } });
  };

  const handleSelectSlot = ({ start, end }) => {
    navigate('/appointments', { 
      state: { 
        newAppointment: {
          date_hour: start.toISOString(),
          end_time: end.toISOString()
        }
      } 
    });
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  if (loading) return <div className="calendar">Loading calendar...</div>;
  if (error) return <div className="calendar">{error}</div>;

  return (
    <div className="calendar">
      <h2>Appointments Calendar</h2>
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={true}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.WEEK}
          style={{ height: '100%' }}
          components={{
            toolbar: (toolbarProps) => (
              <CustomToolbar {...toolbarProps} view={view} />
            ),
          }}
          messages={{
            month: 'Month',
            week: 'Week',
            day: 'Day',
            today: 'Today',
            previous: 'Previous',
            next: 'Next',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Event',
            noEventsInRange: 'No appointments in this range',
            allDay: 'All Day',
            more: 'More',
            showMore: (total) => `+${total} more`,
            work_week: 'Work Week',
            yesterday: 'Yesterday',
            tomorrow: 'Tomorrow',
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
