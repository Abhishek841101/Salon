
// src/utils/invoicePdf.js

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

// ======================================================
// FORMAT CURRENCY
// ======================================================

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

// ======================================================
// FORMAT TIME
// ======================================================

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
};

// ======================================================
// ESCAPE HTML
// ======================================================

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ======================================================
// CREATE SERVICE ROWS
// ======================================================

const createServiceRows = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return `
      <tr>
        <td colspan="5" class="empty-row">
          No services added
        </td>
      </tr>
    `;
  }

  return items
    .map((item, index) => {
      const serviceName =
        item?.serviceName ||
        item?.service?.name ||
        "Service";

      const quantity =
        Number(item?.quantity) || 1;

      const price =
        Number(item?.price) || 0;

      const total =
        Number(item?.total) ||
        price * quantity;

      const duration =
        Number(item?.duration) || 0;

      return `
        <tr>
          <td class="serial">
            ${index + 1}
          </td>

          <td class="service-cell">
            <div class="service-name">
              ${escapeHtml(serviceName)}
            </div>

            ${
              duration > 0
                ? `
                  <div class="service-duration">
                    ${duration} min
                  </div>
                `
                : ""
            }
          </td>

          <td class="quantity">
            ${quantity}
          </td>

          <td class="amount">
            ${formatCurrency(price)}
          </td>

          <td class="amount strong">
            ${formatCurrency(total)}
          </td>
        </tr>
      `;
    })
    .join("");
};

// ======================================================
// CREATE INVOICE HTML
// ======================================================

const createInvoiceHtml = (bill) => {
  const items = Array.isArray(bill?.items)
    ? bill.items
    : [];

  // ====================================================
  // BILL VALUES
  // ====================================================

  const invoiceNumber =
    bill?.invoiceNumber || "-";

  const billDate =
    bill?.billDate ||
    bill?.createdAt ||
    new Date();

  // ====================================================
  // CLIENT
  // ====================================================

  const clientName =
    bill?.clientName ||
    bill?.client?.name ||
    "-";

  const clientPhone =
    bill?.clientPhone ||
    bill?.client?.phone ||
    "-";

  const clientEmail =
    bill?.client?.email ||
    "";

  // ====================================================
  // STYLIST / STAFF
  // ====================================================

  const stylistName =
    bill?.stylistName ||
    bill?.stylist?.name ||
    "-";

  const stylistPhone =
    bill?.stylist?.phone ||
    "";

  const stylistSpecialization =
    bill?.stylist?.specialization ||
    "";

  // ====================================================
  // PAYMENT
  // ====================================================

  const paymentMethod =
    bill?.paymentMethod || "-";

  const paymentStatus =
    bill?.paymentStatus || "-";

  // ====================================================
  // AMOUNTS
  // ====================================================

  const subtotal =
    Number(bill?.subtotal) || 0;

  const discount =
    Number(bill?.discount) || 0;

  const tax =
    Number(bill?.tax) || 0;

  const grandTotal =
    Number(bill?.grandTotal) || 0;

  // ====================================================
  // SERVICE ROWS
  // ====================================================

  const serviceRows =
    createServiceRows(items);

  // ====================================================
  // PAYMENT STATUS CLASS
  // ====================================================

  const paymentStatusClass =
    String(paymentStatus)
      .toLowerCase()
      .replace(/\s+/g, "-");

  return `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  Glow Salon Invoice ${escapeHtml(invoiceNumber)}
</title>

<style>

/* =====================================================
   PAGE
===================================================== */

@page {
  size: A4;
  margin: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;

  background: #f3f1ed;

  color: #24211f;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.page {
  width: 210mm;
  min-height: 297mm;

  margin: 0 auto;

  padding: 14mm 15mm 12mm;

  background: #ffffff;

  position: relative;

  overflow: hidden;
}

/* =====================================================
   TOP ACCENT
===================================================== */

.top-accent {
  height: 5px;

  width: 100%;

  background:
    linear-gradient(
      90deg,
      #211d1a 0%,
      #9b7654 45%,
      #d8b895 70%,
      #211d1a 100%
    );

  position: absolute;

  top: 0;

  left: 0;
}

/* =====================================================
   HEADER
===================================================== */

.header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  padding-top: 10px;

  padding-bottom: 22px;

  border-bottom:
    1px solid #e3ded8;
}

.brand {
  width: 56%;
}

.brand-row {
  display: flex;

  align-items: center;

  gap: 11px;
}

.brand-icon {
  width: 43px;

  height: 43px;

  border-radius: 50%;

  background: #211d1a;

  color: #ffffff;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 21px;

  font-weight: 400;
}

.brand-name {
  margin: 0;

  font-size: 27px;

  line-height: 1;

  font-weight: 700;

  letter-spacing: 2.2px;

  color: #211d1a;
}

.brand-subtitle {
  margin-top: 7px;

  font-size: 9px;

  color: #9b7654;

  letter-spacing: 2px;

  text-transform: uppercase;
}

.brand-contact {
  margin-top: 14px;

  font-size: 8.5px;

  line-height: 1.7;

  color: #77716c;
}

.invoice-title {
  text-align: right;

  width: 40%;
}

.invoice-label {
  font-size: 8px;

  font-weight: 700;

  color: #9b7654;

  letter-spacing: 2px;

  text-transform: uppercase;

  margin-bottom: 3px;
}

.invoice-title h1 {
  margin: 0;

  font-size: 34px;

  font-weight: 300;

  letter-spacing: 4px;

  color: #211d1a;
}

.invoice-number {
  margin-top: 8px;

  font-size: 9px;

  color: #77716c;
}

.invoice-number strong {
  color: #211d1a;

  font-weight: 700;
}

/* =====================================================
   INFORMATION CARDS
===================================================== */

.info-section {
  display: flex;

  gap: 14px;

  padding: 20px 0 18px;
}

.info-card {
  width: 50%;

  min-height: 82px;

  padding: 13px 15px;

  background: #faf8f5;

  border:
    1px solid #eee8e1;

  border-radius: 9px;
}

.info-card-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 10px;
}

.info-label {
  font-size: 7.5px;

  font-weight: 700;

  color: #9b7654;

  letter-spacing: 1.6px;

  text-transform: uppercase;
}

.info-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #c6a27f;
}

.info-name {
  font-size: 13px;

  font-weight: 700;

  color: #211d1a;
}

.info-text {
  margin-top: 5px;

  font-size: 8.5px;

  color: #77716c;

  line-height: 1.55;
}

.stylist-highlight {
  color: #9b7654;

  font-weight: 700;
}

/* =====================================================
   SERVICES SECTION
===================================================== */

.section-title-row {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 2px;

  margin-bottom: 8px;
}

.section-title {
  font-size: 9px;

  font-weight: 700;

  color: #211d1a;

  letter-spacing: 1.6px;

  text-transform: uppercase;
}

.section-line {
  flex: 1;

  height: 1px;

  background: #e6e0da;

  margin-left: 12px;
}

.invoice-table {
  width: 100%;

  border-collapse: separate;

  border-spacing: 0;

  overflow: hidden;

  border:
    1px solid #e7e1db;

  border-radius: 8px;
}

.invoice-table thead {
  background: #211d1a;
}

.invoice-table th {
  padding: 10px 9px;

  font-size: 7.5px;

  font-weight: 700;

  color: #ffffff;

  letter-spacing: 1px;

  text-transform: uppercase;
}

.invoice-table td {
  padding: 11px 9px;

  font-size: 9px;

  border-bottom:
    1px solid #eee9e4;

  vertical-align: middle;
}

.invoice-table tbody tr:last-child td {
  border-bottom: none;
}

.serial {
  width: 8%;

  text-align: center;

  color: #8a837c;
}

.service-cell {
  width: 45%;
}

.service-name {
  font-weight: 700;

  color: #292522;
}

.service-duration {
  margin-top: 3px;

  font-size: 7.5px;

  color: #9a938d;
}

.quantity {
  width: 10%;

  text-align: center;

  color: #5f5954;
}

.amount {
  width: 18.5%;

  text-align: right;

  color: #5f5954;
}

.amount.strong {
  color: #211d1a;

  font-weight: 700;
}

.empty-row {
  text-align: center;

  padding: 22px !important;

  color: #8a837c;
}

/* =====================================================
   LOWER AREA
===================================================== */

.bottom-section {
  display: flex;

  justify-content: space-between;

  gap: 30px;

  margin-top: 20px;
}

.payment-box {
  width: 48%;

  padding: 14px;

  border:
    1px solid #e7e1db;

  border-radius: 8px;

  background: #faf8f5;
}

.payment-title {
  margin-bottom: 11px;

  font-size: 7.5px;

  font-weight: 700;

  color: #9b7654;

  letter-spacing: 1.5px;

  text-transform: uppercase;
}

.payment-line {
  display: flex;

  justify-content: space-between;

  gap: 10px;

  margin-bottom: 7px;

  font-size: 9px;

  color: #706963;
}

.payment-line:last-child {
  margin-bottom: 0;
}

.payment-line strong {
  color: #211d1a;
}

.status-pill {
  display: inline-block;

  padding: 3px 8px;

  border-radius: 20px;

  background: #eee9e3;

  color: #4e4843;

  font-size: 7.5px;

  font-weight: 700;
}

/* =====================================================
   TOTALS
===================================================== */

.totals-box {
  width: 45%;

  padding-top: 3px;
}

.total-row {
  display: flex;

  justify-content: space-between;

  padding: 6px 0;

  font-size: 9px;

  color: #716a64;
}

.total-row span:last-child {
  color: #39332f;
}

.discount-row span:last-child {
  color: #8e6b4d;
}

.grand-total {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 7px;

  padding: 12px 13px;

  border-radius: 8px;

  background: #211d1a;

  color: #ffffff;

  font-size: 12px;

  font-weight: 700;
}

.grand-total-value {
  color: #e5c29f;

  font-size: 15px;
}

/* =====================================================
   NOTES
===================================================== */

.notes {
  margin-top: 19px;

  padding: 12px 14px;

  border-left:
    3px solid #b18b66;

  background: #faf8f5;

  border-radius: 0 7px 7px 0;
}

.notes-label {
  margin-bottom: 5px;

  font-size: 7.5px;

  font-weight: 700;

  color: #9b7654;

  letter-spacing: 1.4px;

  text-transform: uppercase;
}

.notes-text {
  font-size: 8.5px;

  color: #66605a;

  line-height: 1.5;
}

/* =====================================================
   FOOTER
===================================================== */

.footer {
  margin-top: 34px;

  padding-top: 17px;

  border-top:
    1px solid #e1dcd6;

  text-align: center;
}

.footer-symbol {
  font-size: 15px;

  color: #9b7654;

  margin-bottom: 5px;
}

.thank-you {
  font-size: 11px;

  font-weight: 700;

  color: #211d1a;

  letter-spacing: 1px;
}

.footer-text {
  margin-top: 5px;

  font-size: 8px;

  color: #817a74;
}

.footer-contact {
  margin-top: 8px;

  font-size: 7.5px;

  color: #9b7654;

  letter-spacing: 1px;
}

/* =====================================================
   WATERMARK
===================================================== */

.watermark {
  position: absolute;

  bottom: 6mm;

  right: 15mm;

  font-size: 6.5px;

  color: #c8c1ba;

  letter-spacing: 1px;

  text-transform: uppercase;
}

</style>

</head>

<body>

<div class="page">

  <div class="top-accent"></div>

  <!-- =================================================
       HEADER
  ================================================== -->

  <div class="header">

    <div class="brand">

      <div class="brand-row">

        <div class="brand-icon">
          ✦
        </div>

        <div>

          <div class="brand-name">
            GLOW SALON
          </div>

          <div class="brand-subtitle">
            Beauty • Hair • Skin
          </div>

        </div>

      </div>

      <div class="brand-contact">
        Salon & Beauty Studio<br>
        Phone: +91 XXXXX XXXXX
        &nbsp;&nbsp;•&nbsp;&nbsp;
        Email: glowsalon@example.com
      </div>

    </div>


    <div class="invoice-title">

      <div class="invoice-label">
        Official Receipt
      </div>

      <h1>
        INVOICE
      </h1>

      <div class="invoice-number">
        Invoice No:
        <strong>
          ${escapeHtml(invoiceNumber)}
        </strong>
      </div>

      <div class="invoice-number">
        Date:
        <strong>
          ${formatDate(billDate)}
        </strong>
      </div>

    </div>

  </div>


  <!-- =================================================
       CLIENT + STYLIST
  ================================================== -->

  <div class="info-section">

    <!-- CLIENT -->

    <div class="info-card">

      <div class="info-card-header">

        <div class="info-label">
          Bill To
        </div>

        <div class="info-dot"></div>

      </div>

      <div class="info-name">
        ${escapeHtml(clientName)}
      </div>

      <div class="info-text">

        ${
          clientPhone
            ? `Phone: ${escapeHtml(clientPhone)}`
            : ""
        }

        ${
          clientEmail
            ? `<br>Email: ${escapeHtml(clientEmail)}`
            : ""
        }

      </div>

    </div>


    <!-- STYLIST -->

    <div class="info-card">

      <div class="info-card-header">

        <div class="info-label">
          Served By
        </div>

        <div class="info-dot"></div>

      </div>

      <div class="info-name stylist-highlight">
        ${escapeHtml(stylistName)}
      </div>

      <div class="info-text">

        ${
          stylistSpecialization
            ? escapeHtml(
                stylistSpecialization
              )
            : "Salon Staff / Stylist"
        }

        ${
          stylistPhone
            ? `<br>Phone: ${escapeHtml(
                stylistPhone
              )}`
            : ""
        }

      </div>

    </div>

  </div>


  <!-- =================================================
       SERVICES
  ================================================== -->

  <div class="section-title-row">

    <div class="section-title">
      Services
    </div>

    <div class="section-line"></div>

  </div>


  <table class="invoice-table">

    <thead>

      <tr>

        <th>
          #
        </th>

        <th style="text-align:left;">
          Service
        </th>

        <th>
          Qty
        </th>

        <th style="text-align:right;">
          Rate
        </th>

        <th style="text-align:right;">
          Amount
        </th>

      </tr>

    </thead>

    <tbody>

      ${serviceRows}

    </tbody>

  </table>


  <!-- =================================================
       PAYMENT + TOTALS
  ================================================== -->

  <div class="bottom-section">

    <!-- PAYMENT -->

    <div class="payment-box">

      <div class="payment-title">
        Payment Details
      </div>

      <div class="payment-line">

        <span>
          Method
        </span>

        <strong>
          ${escapeHtml(paymentMethod)}
        </strong>

      </div>

      <div class="payment-line">

        <span>
          Status
        </span>

        <span class="status-pill">
          ${escapeHtml(paymentStatus)}
        </span>

      </div>

      <div class="payment-line">

        <span>
          Invoice Date
        </span>

        <strong>
          ${formatDate(billDate)}
        </strong>

      </div>

    </div>


    <!-- TOTALS -->

    <div class="totals-box">

      <div class="total-row">

        <span>
          Subtotal
        </span>

        <span>
          ${formatCurrency(subtotal)}
        </span>

      </div>


      ${
        discount > 0
          ? `
            <div class="total-row discount-row">

              <span>
                Discount
              </span>

              <span>
                - ${formatCurrency(discount)}
              </span>

            </div>
          `
          : ""
      }


      ${
        tax > 0
          ? `
            <div class="total-row">

              <span>
                Tax
              </span>

              <span>
                ${formatCurrency(tax)}
              </span>

            </div>
          `
          : ""
      }


      <div class="grand-total">

        <span>
          TOTAL
        </span>

        <span class="grand-total-value">
          ${formatCurrency(grandTotal)}
        </span>

      </div>

    </div>

  </div>


  <!-- =================================================
       NOTES
  ================================================== -->

  ${
    bill?.notes
      ? `
        <div class="notes">

          <div class="notes-label">
            Notes
          </div>

          <div class="notes-text">
            ${escapeHtml(bill.notes)}
          </div>

        </div>
      `
      : ""
  }


  <!-- =================================================
       FOOTER
  ================================================== -->

  <div class="footer">

    <div class="footer-symbol">
      ✦
    </div>

    <div class="thank-you">
      Thank You For Visiting Glow Salon
    </div>

    <div class="footer-text">
      We appreciate your visit and look forward
      to seeing you again.
    </div>

    <div class="footer-contact">
      GLOW SALON
      &nbsp;•&nbsp;
      BEAUTY
      &nbsp;•&nbsp;
      HAIR
      &nbsp;•&nbsp;
      SKIN
    </div>

  </div>


  <div class="watermark">
    GLOW SALON • INVOICE
  </div>

</div>

</body>

</html>
`;
};

// ======================================================
// GENERATE PDF
// ======================================================

export const generateInvoicePdf = async (bill) => {
  try {
    if (!bill) {
      throw new Error(
        "Bill data is required."
      );
    }

    const html =
      createInvoiceHtml(bill);

    console.log(
      "GENERATING INVOICE PDF..."
    );

    // Generate PDF as BASE64
    const result =
      await Print.printToFileAsync({
        html,
        base64: true,
      });

    if (!result?.base64) {
      console.log(
        "PRINT RESULT:",
        result
      );

      throw new Error(
        "PDF base64 data was not generated."
      );
    }

    const cacheDirectory =
      FileSystem.cacheDirectory;

    if (!cacheDirectory) {
      throw new Error(
        "FileSystem cache directory is unavailable."
      );
    }

    const fileName =
      `GlowSalon-Invoice-${Date.now()}.pdf`;

    const fileUri =
      `${cacheDirectory}${fileName}`;

    console.log(
      "WRITING PDF:",
      fileUri
    );

    await FileSystem.writeAsStringAsync(
      fileUri,
      result.base64,
      {
        encoding:
          FileSystem.EncodingType.Base64,
      }
    );

    const fileInfo =
      await FileSystem.getInfoAsync(
        fileUri
      );

    if (!fileInfo.exists) {
      throw new Error(
        "PDF file was not created."
      );
    }

    console.log(
      "PDF CREATED SUCCESSFULLY:",
      fileUri
    );

    return fileUri;

  } catch (error) {
    console.error(
      "INVOICE PDF ERROR:",
      error
    );

    throw error;
  }
};

// ======================================================
// SHARE PDF
// ======================================================

export const shareInvoicePdf = async (
  pdfUri
) => {
  try {
    if (!pdfUri) {
      throw new Error(
        "PDF URI is required."
      );
    }

    const sharingAvailable =
      await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
      throw new Error(
        "Sharing is not available on this device."
      );
    }

    const fileInfo =
      await FileSystem.getInfoAsync(
        pdfUri
      );

    console.log(
      "PDF SHARE FILE:",
      fileInfo
    );

    if (!fileInfo.exists) {
      throw new Error(
        "PDF file does not exist."
      );
    }

    await Sharing.shareAsync(
      pdfUri,
      {
        mimeType:
          "application/pdf",

        dialogTitle:
          "Share Glow Salon Invoice",

        UTI:
          "com.adobe.pdf",
      }
    );

    console.log(
      "INVOICE SHARED SUCCESSFULLY"
    );

    return true;

  } catch (error) {
    console.error(
      "INVOICE SHARE ERROR:",
      error
    );

    throw error;
  }
};

// ======================================================
// GENERATE + SHARE
// ======================================================

export const generateAndShareInvoice =
  async (bill) => {
    try {
      const pdfUri =
        await generateInvoicePdf(
          bill
        );

      await shareInvoicePdf(
        pdfUri
      );

      return pdfUri;

    } catch (error) {
      console.error(
        "GENERATE + SHARE INVOICE ERROR:",
        error
      );

      throw error;
    }
  };

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default {
  generateInvoicePdf,
  shareInvoicePdf,
  generateAndShareInvoice,
};

