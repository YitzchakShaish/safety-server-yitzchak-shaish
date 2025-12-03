import { EventReport } from "../entities/EventReport";

export function formatEventReportForClient(report: EventReport) {
  return {
    id: report.id,
    reporterInfo: {
      fullName: report.reporter.fullName,
      phone: report.reporterProfile.phone || "",
      position: report.reporterProfile.position,
      unit: report.reporterProfile.unit,
      subUnit: report.reporterProfile.subUnit,
      reportDate: report.createdAt,
      reportTime: report.eventInfo?.eventTime || "",
    },
    eventInfo: {
      eventDate: report.eventInfo?.eventDate || "",
      eventTime: report.eventInfo?.eventTime || "",
      eventDescription: report.eventInfo?.eventDescription || "",
      unitActivityType: report.eventInfo?.unitActivityType || "",
      personalActivityType: report.eventInfo?.personalActivityType || "",
      category: report.eventInfo?.category || "",
      location: report.eventInfo?.location || "",
      eventSeverity: report.eventInfo?.eventSeverity || "",
      eventResult: report.eventInfo?.eventResult || "",
      weatherCondition: report.eventInfo?.weatherCondition || "",
    },
    summaryInfo: {
      eventStatus: report.summaryInfo?.eventStatus || "",
      injuryLevel: report.summaryInfo?.injuryLevel || "",
      injuryDetails: report.summaryInfo?.injuryDetails || "",
      recommendations: report.summaryInfo?.recommendations || "",
      approval: report.summaryInfo?.approval || false,
    },
  };
}
