const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function previousMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function growth(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function countSince(Model, fromDate) {
  return Model.countDocuments({ createdAt: { $gte: fromDate } });
}

async function revenueSince(fromDate) {
  const result = await Invoice.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total || 0;
}

async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = previousMonth(now);

    // Ensure we consistently parse the appointment `date` field (stored as YYYY-MM-DD string)
    const todayISO = now.toISOString().slice(0, 10);

    const [
      totalPatients,
      totalAppointments,
      availableDoctors,
      totalRevenueAgg,
      patientsThisMonth,
      patientsLastMonth,
      appointmentsThisMonth,
      appointmentsLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      todayAppointments,
      appointments,
      doctors,
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments({ status: { $regex: /^available$/i } }),
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      countSince(Patient, thisMonth),
      Patient.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      countSince(Appointment, thisMonth),
      Appointment.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      revenueSince(thisMonth),
      revenueSince(lastMonth),
      Appointment.countDocuments({ date: todayISO }),
      Appointment.find().sort({ date: 1, time: 1, createdAt: -1 }).limit(8),
      Doctor.find().sort({ rating: -1, createdAt: -1 }).limit(3),
    ]);


    const patientTrends = await Promise.all(
      Array.from({ length: 6 }, async (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const [patients, appointmentsCount] = await Promise.all([
          // Total patients up to the end of the month
          Patient.countDocuments({ createdAt: { $lt: nextMonth } }),
          // Appointments created during the month
          Appointment.countDocuments({ createdAt: { $gte: date, $lt: nextMonth } }),
        ]);

        return {
          month: monthNames[date.getMonth()],
          patients,
          appointments: appointmentsCount,
        };
      })
    );

    // Weekly patient visits (Mon-Sun) computed from Appointment `date`
    // Note: Appointment `date` is stored as YYYY-MM-DD string, so we query by that.
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay(); // 0=Sun
    // Shift so that week starts on Mon
    const diffToMonday = (dayOfWeek + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyPatients = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        const patients = await Appointment.countDocuments({ date: iso });
        return { day: weekdayNames[d.getDay()], patients };
      })
    );

    // Revenue (and expenses placeholder) for last 6 months from Invoice amounts
    const revenueSeries = await Promise.all(
      Array.from({ length: 6 }, async (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const amount = await Invoice.aggregate([
          { $match: { createdAt: { $gte: date, $lt: nextMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return { month: monthNames[date.getMonth()], revenue: amount[0]?.total || 0 };
      })
    );

    // You currently don’t have an expenses model/field in the backend.
    // To keep Reports charts fully data-driven (no hardcoded mock), we return 0 expenses.
    const expensesSeries = revenueSeries.map((r) => ({ month: r.month, expenses: 0 }));


    const departmentGroups = await Appointment.aggregate([
      { $match: { department: { $nin: [null, ""] } } },
      { $group: { _id: "$department", patients: { $sum: 1 } } },
      { $sort: { patients: -1 } },
      { $limit: 5 },
    ]);

    const typeGroups = await Appointment.aggregate([
      { $match: { type: { $nin: [null, ""] } } },
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    const statusGroups = await Appointment.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    res.json({
      stats: {
        totalPatients,
        todayAppointments,
        totalAppointments,
        availableDoctors,
        monthlyRevenue: totalRevenueAgg[0]?.total || 0,
        patientGrowth: growth(patientsThisMonth, patientsLastMonth),
        appointmentGrowth: growth(appointmentsThisMonth, appointmentsLastMonth),
        revenueGrowth: growth(revenueThisMonth, revenueLastMonth),
      },
      patientTrends,

      // Used by ReportsPage (real data-driven charts)
      weeklyPatients,
      revenueSeries,
      expensesSeries,

      departmentStats: departmentGroups.map((item, index) => ({
        name: item._id,
        patients: item.patients,
        color: ["#2a9d8f", "#6bbcba", "#1a3340", "#1d6a60", "#e9c46a"][index % 5],
      })),
      appointmentTypes: typeGroups.map((item, index) => ({
        name: item._id,
        value: item.value,
        color: ["#2a9d8f", "#6bbcba", "#e05c6a", "#1a3340", "#e9c46a"][index % 5],
      })),
      appointmentStatuses: statusGroups.map((item) => ({ name: item._id || "Unknown", value: item.value })),
      upcomingAppointments: appointments,
      featuredDoctors: doctors,
      recentActivity: appointments.slice(0, 6).map((appointment) => ({
        id: appointment._id,
        action: `Appointment ${appointment.status || "created"}`,
        patient: appointment.patientName,
        time: appointment.updatedAt || appointment.createdAt,
        type: "appointment",
      })),
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
