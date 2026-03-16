import jsPDF from "jspdf";
import type { TimelineEvent } from "@/components/Timeline";

interface VerificationData {
  generatedAt: string;
  hash: string;
}

interface Violation {
  law_section: string;
  reasoning: string;
}

export async function generateLegalPDF(
  events: TimelineEvent[],
  verification: VerificationData | null,
  isOfficerMode: boolean = false,
  potentialViolations: Violation[] | null = null
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

  // Emblem for Officer Mode
  if (isOfficerMode) {
    try {
      const img = new Image();
      img.src = "/emblem.png";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // Draw emblem centered
      doc.addImage(img, 'PNG', pageW / 2 - 12.5, y, 25, 33);
      y += 40;
    } catch(e) {
      console.error("Failed to load emblem for PDF", e);
    }
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(isOfficerMode ? "Legal Assessment Report" : "Solace — Structured Timeline", pageW / 2, y, { align: "center" });
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

  // Suggested Charges (Officer Mode Only)
  if (isOfficerMode && potentialViolations && potentialViolations.length > 0) {
    checkPage(40);
    y += 10;
    
    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Suggested Charges", margin, y);
    y += 8;

    potentialViolations.forEach((violation) => {
      checkPage(25);
      
      // Law Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(180, 0, 0); // Red-ish for warning
      doc.text(violation.law_section, margin, y);
      doc.setTextColor(0);
      y += 5;

      // Reasoning
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(violation.reasoning, contentW - 5);
      checkPage(lines.length * 4.5 + 6);
      doc.text(lines, margin + 5, y);
      y += lines.length * 4.5 + 4;
    });
  }

  // Digital Certificate of Authenticity
  console.log("[Solace PDF] verification param:", JSON.stringify(verification));
  if (verification) {
    checkPage(70);
    y += 6;

    // Double-line border top
    doc.setDrawColor(60);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
    y += 10;

    // Certificate title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("DIGITAL CERTIFICATE OF AUTHENTICITY", pageW / 2, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("This section constitutes a tamper-evident cryptographic record.", pageW / 2, y, { align: "center" });
    doc.setTextColor(0);
    y += 10;

    // Timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("GENERATED AT:", margin, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(verification.generatedAt, margin, y);
    y += 9;

    // SHA-256 Hash
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SHA-256 CRYPTOGRAPHIC HASH:", margin, y);
    y += 6;

    // Hash in bordered box
    doc.setDrawColor(160);
    doc.setFillColor(245, 245, 245);
    const hashLines = doc.splitTextToSize(verification.hash, contentW - 10);
    const boxH = hashLines.length * 4.5 + 6;
    doc.roundedRect(margin, y - 3, contentW, boxH, 1.5, 1.5, "FD");

    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30);
    doc.text(hashLines, margin + 5, y + 1);
    doc.setTextColor(0);
    y += boxH + 6;

    // Disclaimer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(120);
    const disclaimer = "This SHA-256 hash cryptographically binds the above timeline content to the stated timestamp. Any modification to the original data will produce a different hash, thereby evidencing tampering.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentW);
    doc.text(disclaimerLines, margin, y);
    y += disclaimerLines.length * 3.5 + 4;

    // Double-line border bottom
    doc.setTextColor(0);
    doc.setDrawColor(60);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
  }

  doc.save("solace-timeline.pdf");
}
