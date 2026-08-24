package com.sareesfornaaris.auth.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import com.sareesfornaaris.auth.entity.Invoice;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.OrderItem;
import com.sareesfornaaris.auth.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public Invoice getOrCreateInvoice(Order order) {
        return invoiceRepository.findByOrder(order).orElseGet(() -> {
            Invoice inv = Invoice.builder()
                    .order(order)
                    .invoiceNumber("INV-" + System.currentTimeMillis())
                    .build();
            return invoiceRepository.save(inv);
        });
    }

    public byte[] generatePdfInvoice(Order order) throws Exception {
        Invoice invoice = getOrCreateInvoice(order);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.GRAY);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);

        // Header Table
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});

        PdfPCell cellLeft = new PdfPCell();
        cellLeft.setBorder(Rectangle.NO_BORDER);
        cellLeft.addElement(new Paragraph("SAREES FOR NAARIS", titleFont));
        cellLeft.addElement(new Paragraph("Pure Handloom Silk & Designer Sarees", subTitleFont));
        cellLeft.addElement(new Paragraph("GSTIN: 29AAAAA0000A1Z5 | Support: support@sareesfornaaris.com", normalFont));

        PdfPCell cellRight = new PdfPCell();
        cellRight.setBorder(Rectangle.NO_BORDER);
        cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellRight.addElement(new Paragraph("TAX INVOICE", titleFont));
        cellRight.addElement(new Paragraph("Invoice No: " + invoice.getInvoiceNumber(), boldFont));
        cellRight.addElement(new Paragraph("Order ID: " + order.getOrderId(), normalFont));
        cellRight.addElement(new Paragraph("Date: " + (order.getCreatedAt() != null ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A"), normalFont));

        headerTable.addCell(cellLeft);
        headerTable.addCell(cellRight);
        document.add(headerTable);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        document.add(new Paragraph(" "));

        // Address & Payment Info Table
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{50, 50});

        PdfPCell shipCell = new PdfPCell();
        shipCell.setBorder(Rectangle.NO_BORDER);
        shipCell.addElement(new Paragraph("Shipping Address:", boldFont));
        shipCell.addElement(new Paragraph(order.getAddressSnapshot() != null ? order.getAddressSnapshot() : "N/A", normalFont));

        PdfPCell payCell = new PdfPCell();
        payCell.setBorder(Rectangle.NO_BORDER);
        payCell.addElement(new Paragraph("Payment Method: " + (order.getPaymentMethod() != null ? order.getPaymentMethod() : "COD"), normalFont));
        payCell.addElement(new Paragraph("Payment Status: " + (order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING"), normalFont));
        payCell.addElement(new Paragraph("Order Status: " + (order.getStatus() != null ? order.getStatus() : "Placed"), normalFont));

        infoTable.addCell(shipCell);
        infoTable.addCell(payCell);
        document.add(infoTable);

        document.add(new Paragraph(" "));

        // Line Items Table
        PdfPTable itemsTable = new PdfPTable(4);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{40, 20, 20, 20});

        addTableHeader(itemsTable, "Product", boldFont);
        addTableHeader(itemsTable, "Unit Price", boldFont);
        addTableHeader(itemsTable, "Qty", boldFont);
        addTableHeader(itemsTable, "Total", boldFont);

        BigDecimal subtotal = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String pName = item.getProduct() != null ? item.getProduct().getName() : "Saree Item";
                BigDecimal price = item.getPricePerUnit() != null ? item.getPricePerUnit() : BigDecimal.ZERO;
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                BigDecimal lineTotal = item.getTotalPrice() != null ? item.getTotalPrice() : price.multiply(BigDecimal.valueOf(qty));

                subtotal = subtotal.add(lineTotal);

                itemsTable.addCell(new Paragraph(pName, normalFont));
                itemsTable.addCell(new Paragraph("₹" + price, normalFont));
                itemsTable.addCell(new Paragraph(String.valueOf(qty), normalFont));
                itemsTable.addCell(new Paragraph("₹" + lineTotal, normalFont));
            }
        }

        document.add(itemsTable);

        document.add(new Paragraph(" "));

        // Totals Table
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(40);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        totalsTable.addCell(new Paragraph("Subtotal:", normalFont));
        totalsTable.addCell(new Paragraph("₹" + subtotal, normalFont));

        BigDecimal tax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        totalsTable.addCell(new Paragraph("Tax (GST):", normalFont));
        totalsTable.addCell(new Paragraph("₹" + tax, normalFont));

        BigDecimal shipping = order.getShippingCharge() != null ? order.getShippingCharge() : BigDecimal.ZERO;
        totalsTable.addCell(new Paragraph("Shipping:", normalFont));
        totalsTable.addCell(new Paragraph("₹" + shipping, normalFont));

        totalsTable.addCell(new Paragraph("Grand Total:", boldFont));
        totalsTable.addCell(new Paragraph("₹" + (order.getTotalAmount() != null ? order.getTotalAmount() : subtotal), boldFont));

        document.add(totalsTable);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Thank you for shopping with Sarees for Naaris!", boldFont));

        document.close();
        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        table.addCell(cell);
    }
}
