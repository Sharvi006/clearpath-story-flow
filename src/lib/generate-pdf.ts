import jsPDF from "jspdf";
import type { TimelineEvent } from "@/components/Timeline";

interface VerificationData {
  generatedAt: string;
  hash: string;
}

export function generateLegalPDF(
  events: TimelineEvent[],
  verification: VerificationData | null
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };
  const checkPage = (needed: number) => {
    if (y + needed > 277) addPage();
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Solace — Structured Timeline", pageW / 2, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 6;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Events
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Chronological Events", margin, y);
  y += 8;

  events.forEach((event, i) => {
    checkPage(30);

    // Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${i + 1}. ${event.date}`, margin, y);
    y += 5;

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(event.description, contentW - 5);
    checkPage(lines.length * 4.5 + 6);
    doc.text(lines, margin + 5, y);
    y += lines.length * 4.5;

    // People
    if (event.people.length > 0) {
      checkPage(6);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100);
      doc.text(`People: ${event.people.join(", ")}`, margin + 5, y);
      doc.setTextColor(0);
      y += 5;
    }

    y += 4;
  });

  // Verification Certificate
  if (verification) {
    checkPage(45);
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Digital Verification Certificate", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Timestamp:", margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(verification.generatedAt, margin + 25, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text("SHA-256 Hash:", margin, y);
    y += 5;

    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    const hashLines = doc.splitTextToSize(verification.hash, contentW);
    doc.text(hashLines, margin, y);
    y += hashLines.length * 4 + 6;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(130);
    doc.text(
      "This hash cryptographically verifies the integrity of the above timeline at the stated timestamp.",
      margin,
      y
    );
  }

  doc.save("solace-timeline.pdf");
}
