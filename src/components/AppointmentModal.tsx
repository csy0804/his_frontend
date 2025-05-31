import { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, CreditCard } from 'lucide-react';
import { createAppointment, updateAppointment } from '../lib/appointments';
import { getSpecialities, getDoctorsBySpecialization, getDoctorCharges } from '../lib/doctors';
import toast from 'react-hot-toast';
import type { Appointment, Doctor } from '../types';
import { cn } from '../lib/utils';
import { format, addMinutes } from 'date-fns';
import Modal from './ui/Modal';

interface AppointmentModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentModal({ appointment, onClose, onSuccess }: AppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [appointmentCharges, setAppointmentCharges] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    speciality: '',
    doctor_id: appointment?.doctor_id?.toString() || '',
    date: appointment ? format(new Date(appointment.appointment_datetime), 'yyyy-MM-dd') : '',
    time: appointment ? format(new Date(appointment.appointment_datetime), 'HH:mm') : '',
    reason: appointment?.reason || '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSpecialities();
      if (appointment) {
        setFormData({
          speciality: '',
          doctor_id: appointment.doctor_id.toString() || '',
          date: format(new Date(appointment.appointment_datetime), 'yyyy-MM-dd'),
          time: format(new Date(appointment.appointment_datetime), 'HH:mm'),
          reason: appointment.reason || '',
        });
        if (appointment.doctor_id) {
          await fetchDoctorCharges(appointment.doctor_id);
        }
      }
    };
    fetchInitialData();
  }, [appointment]);

  useEffect(() => {
    if (formData.speciality && formData.date && formData.time) {
      fetchDoctors(formData.speciality, formData.date, formData.time);
    }
  }, [formData.speciality, formData.date, formData.time]);

  useEffect(() => {
    if (formData.doctor_id) {
      fetchDoctorCharges(Number(formData.doctor_id));
    } else {
      setAppointmentCharges(null);
    }
  }, [formData.doctor_id]);

  const fetchSpecialities = async () => {
    try {
      const data = await getSpecialities();
      setSpecialities(data);
    } catch (error) {
      console.error('Error fetching specialities:', error);
      toast.error('Failed to load specialities');
    }
  };

  const fetchDoctors = async (speciality: string, date: string, time: string) => {
    setLoading(true);
    try {
      const datetime = `${date}T${time}`;
      const data = await getDoctorsBySpecialization(speciality, datetime) as Doctor[];
      setDoctors(data as Doctor[]);
      if (appointment && data.find(doc => doc.id === appointment.doctor_id)) {
        setFormData(prev => ({ ...prev, doctor_id: appointment.doctor_id.toString() }));
      } else {
        setFormData(prev => ({ ...prev, doctor_id: '' }));
        setAppointmentCharges(null);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load available doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorCharges = async (doctorId: number) => {
    try {
      const charges = await getDoctorCharges(doctorId);
      setAppointmentCharges(charges);
    } catch (error) {
      console.error('Error fetching doctor charges:', error);
      toast.error('Failed to load appointment charges');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointmentData = {
        doctor_id: Number(formData.doctor_id),
        appointment_datetime: `${formData.date}T${formData.time}`,
        reason: formData.reason,
      };

      if (appointment) {
        await updateAppointment(appointment.id, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await createAppointment(appointmentData);
        toast.success('Appointment created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');
  
  const getMinTime = () => {
    if (formData.date === minDate) {
      const now = new Date();
      const roundedTime = addMinutes(now, 30 - (now.getMinutes() % 30));
      return format(roundedTime, 'HH:mm');
    }
    return '09:00';
  };

  const generateTimeSlots = () => {
    const slots = [];
    const minTime = formData.date === minDate ? getMinTime() : '09:00';
    const [minHour, minMinute] = minTime.split(':').map(Number);
    let hour = minHour;
    let minute = Math.ceil(minMinute / 30) * 30;

    while (hour < 17 || (hour === 17 && minute === 0)) {
      if (minute >= 60) {
        hour++;
        minute = 0;
      }
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      if (formData.date > minDate || timeString >= getMinTime()) {
        slots.push(timeString);
      }
      minute += 30;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Modal
      title={appointment ? 'Edit Appointment' : 'New Appointment'}
      onClose={onClose}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setFormData(prev => ({ ...prev, date: selectedDate, time: '' }));
                if (selectedDate && formData.speciality && formData.time) {
                  fetchDoctors(formData.speciality, selectedDate, formData.time);
                }
              }}
              min={minDate}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} />
              Time
            </label>
            <select
              value={formData.time}
              onChange={(e) => {
                const selectedTime = e.target.value;
                setFormData(prev => ({ ...prev, time: selectedTime }));
                if (selectedTime && formData.speciality && formData.date) {
                  fetchDoctors(formData.speciality, formData.date, selectedTime);
                }
              }}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              required
              disabled={!formData.date}
            >
              <option value="">Select time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speciality
          </label>
          <select
            value={formData.speciality}
            onChange={(e) => {
              const selectedSpeciality = e.target.value;
              setFormData(prev => ({ ...prev, speciality: selectedSpeciality, doctor_id: '' }));
              if (selectedSpeciality && formData.date && formData.time) {
                fetchDoctors(selectedSpeciality, formData.date, formData.time);
              }
            }}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            required
          >
            <option value="">Select a speciality</option>
            {specialities.map((speciality) => (
              <option key={speciality} value={speciality}>
                {speciality}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Doctor
          </label>
          <select
            value={formData.doctor_id}
            onChange={(e) => setFormData(prev => ({ ...prev, doctor_id: e.target.value }))}
            className={cn(
              "w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary",
              loading && "animate-pulse"
            )}
            required
            disabled={!formData.speciality || !formData.date || !formData.time}
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id.toString()}>
                {doctor.fullname} - {doctor.department_name}
              </option>
            ))}
          </select>
          {formData.speciality && formData.date && formData.time && doctors.length === 0 && !loading && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              No doctors available at the selected time
            </p>
          )}
        </div>

        {appointmentCharges !== null && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                <CreditCard size={20} />
                <span className="font-medium">Appointment Charges</span>
                </div>
              <span className="text-lg font-semibold">Ksh {appointmentCharges}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Please describe your reason for the appointment..."
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading || doctors.length === 0}
            className="px-6 py-3 text-white bg-primary hover:bg-primary-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : appointment ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}