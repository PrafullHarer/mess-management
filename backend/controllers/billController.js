const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/userModel');
const { Mess } = require('../models/messModel');
const PDFDocument = require('pdfkit');

// Always keep generating only for students who have a pending amount
const getBills = asyncHandler(async (req, res) => {
    const query = { role: 'STUDENT', isDeleted: false };
    if (req.user.role === 'STUDENT') {
        query._id = req.user.id;
    } else if (req.user.messId) {
        query.messId = req.user.messId;
    }
    const students = await User.find(query).sort({ name: 1 });
    console.log(`[getBills] Found ${students.length} students. Checking dues...`);
    
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    let ownerUpiId = "prafullharer@slc";
    let ownerName = "Prafull Harer";

    if (req.user.messId) {
        const mess = await Mess.findById(req.user.messId).populate('ownerId');
        if (mess && mess.ownerId) {
            ownerUpiId = mess.ownerId.upiId || ownerUpiId;
            ownerName = mess.ownerId.name || ownerName;
        }
    }

    const bills = students.map(s => {
        const amount = Number(s.amount) || 0;
        const paid = Number(s.paid) || 0;
        const pendingAmount = amount - paid;
        console.log(`[getBills] Student ${s.name}: amount=${s.amount}, paid=${s.paid}, pending=${pendingAmount}`);

        let studentBills = [];

        const breakdown = {
            joined_at: s.joinedAt ? (typeof s.joinedAt === 'string' ? s.joinedAt : s.joinedAt.toISOString().split('T')[0]) : 'N/A',
            meal_slot: s.plan || 'Cycle',
            end_date: (() => {
                if (!s.joinedAt) return 'N/A';
                const d = new Date(s.joinedAt);
                d.setDate(d.getDate() + 30);
                return d.toISOString().split('T')[0];
            })()
        };

        if (pendingAmount > 0) {
            studentBills.push({
                id: s._id.toString() + '-pending',
                student_id: s._id.toString(),
                student_name: s.name,
                mobile: s.mobile,
                month: currentMonth,
                year: currentYear,
                amount: pendingAmount.toString(),
                status: 'PENDING',
                generatedAt: now.toISOString(),
                upiId: ownerUpiId,
                payeeName: ownerName,
                breakdown
            });
        }

        if (paid > 0) {
            let pMonth = currentMonth;
            let pYear = currentYear;
            // Best effort to extract month from payment notes if available
            if (s.paymentNotes && s.paymentNotes.includes('[')) {
                // simple heuristic
            }
            studentBills.push({
                id: s._id.toString() + '-paid',
                student_id: s._id.toString(),
                student_name: s.name,
                mobile: s.mobile,
                month: currentMonth,
                year: currentYear,
                amount: paid.toString(),
                status: 'PAID',
                generatedAt: now.toISOString(),
                upiId: ownerUpiId,
                payeeName: ownerName,
                breakdown
            });
        }

        return studentBills;
    }).flat();

    res.json(bills);
});

// Update the student's dues instead of a Bill document
const updateBillStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { transactionRef } = req.body;

    const student = await User.findById(id);
    if (!student || student.role !== 'STUDENT') {
        res.status(404);
        throw new Error('Student not found');
    }

    // Set paid equal to amount so pending becomes 0
    student.paid = student.amount;
    
    if (transactionRef) {
        const dateStr = new Date().toLocaleDateString('en-IN');
        student.paymentNotes = student.paymentNotes 
            ? `${student.paymentNotes}\n[${dateStr}] Paid: ${transactionRef}` 
            : `[${dateStr}] Paid: ${transactionRef}`;
    }

    await student.save();
    res.json({ message: 'Student dues marked as paid' });
});

// PDF Bill Download
const downloadBillPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student) {
        res.status(404);
        throw new Error('Student/Bill not found');
    }

    const amount = Number(student.amount) || 0;
    const paid = Number(student.paid) || 0;
    const pendingAmount = amount - paid;

    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const invoiceNo = `INV-${currentYear}-${currentMonth.toUpperCase().slice(0, 3)}-${student.mobile.slice(-4)}`;
    const billDate = now.toLocaleDateString('en-IN');

    let upiId = "prafullharer@slc";
    let payeeName = "Prafull Harer";

    if (student.messId) {
        const mess = await Mess.findById(student.messId).populate('ownerId');
        if (mess && mess.ownerId) {
            upiId = mess.ownerId.upiId || upiId;
            payeeName = mess.ownerId.name || payeeName;
        }
    }

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${pendingAmount}&cu=INR&tn=Mess-Bill-${currentMonth}-${currentYear}`;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Bill_${currentMonth}_${currentYear}_${student.name.replace(/\s+/g, '_')}.pdf`);

    doc.pipe(res);

    // --- Colors ---
    const colors = {
        primary: '#1F2937',  // Slate 800
        accent: '#3B82F6',   // Blue 500
        success: '#10B981',  // Green 500
        lightGray: '#F9FAFB', // Slate 50
        border: '#E5E7EB',   // Gray 200
        textDark: '#111827',
        textLight: '#6B7280'
    };

    let y = 0;

    // Header Background
    doc.rect(0, 0, 595, 130).fill(colors.primary);

    // Header Text
    doc.fillColor('#FFFFFF');
    doc.fontSize(28).font('Helvetica-Bold').text('MESS INVOICE', 50, 45);

    doc.fontSize(10).font('Helvetica').fillColor('#E5E7EB');
    doc.text('Mess & Canteen Management System', 50, 80);
    doc.text('Contact: 7387533549', 50, 95);

    doc.fontSize(10).fillColor('#FFFFFF');
    const metaX = 400;
    let metaY = 45;

    const drawMetaRow = (label, value) => {
        doc.font('Helvetica').text(label, metaX, metaY, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').text(value, metaX + 90, metaY, { width: 100, align: 'right' });
        metaY += 20;
    };

    drawMetaRow('Invoice No:', invoiceNo);
    drawMetaRow('Date:', billDate);
    drawMetaRow('Status:', pendingAmount > 0 ? 'PENDING' : 'PAID');

    y = 170;
    doc.fillColor(colors.textDark);

    doc.fontSize(14).font('Helvetica-Bold').text('BILLED TO:', 50, y);
    y += 25;

    doc.fontSize(12).font('Helvetica').text(student.name, 50, y);
    y += 20;

    doc.fontSize(10).fillColor(colors.textLight);
    doc.text(`Mobile: ${student.mobile}`, 50, y);
    y += 15;
    doc.text(`Plan: ${student.plan || 'Standard'}`, 50, y);
    y += 15;
    const joinedAt = student.joinedAt ? (typeof student.joinedAt === 'string' ? student.joinedAt : student.joinedAt.toISOString().split('T')[0]) : 'N/A';
    doc.text(`Joined: ${joinedAt}`, 50, y);
    y += 25;

    const summaryBoxY = 170;
    doc.roundedRect(350, summaryBoxY, 200, 100, 8).fill(colors.lightGray);

    doc.fillColor(colors.textDark).fontSize(10).font('Helvetica-Bold')
        .text('SUMMARY', 370, summaryBoxY + 15);
    doc.font('Helvetica').fontSize(12)
        .text('Pending Dues', 370, summaryBoxY + 40);
    doc.fontSize(24).font('Helvetica-Bold')
        .fillColor(colors.primary)
        .text(`₹${pendingAmount}`, 370, summaryBoxY + 60);

    y = Math.max(y + 40, 310);

    const tableHeaders = ['DESCRIPTION', 'AMOUNT'];
    const colWidths = [390, 100];
    const colX = [50, 450];

    const drawTableHeader = (currY) => {
        doc.rect(40, currY, 515, 30).fill(colors.lightGray);
        doc.fillColor(colors.textDark).fontSize(10).font('Helvetica-Bold');
        tableHeaders.forEach((h, i) => {
            doc.text(h, colX[i], currY + 10, { width: colWidths[i], align: i === 1 ? 'right' : 'left' });
        });
        return currY + 40;
    };

    y = drawTableHeader(y);

    const drawRow = (desc, amount, isTotal = false) => {
        if (y > 700) {
            doc.addPage();
            y = drawTableHeader(50);
        }
        doc.fillColor(isTotal ? colors.textDark : '#4B5563');
        if (isTotal) doc.font('Helvetica-Bold'); else doc.font('Helvetica');

        doc.text(desc, colX[0], y, { width: colWidths[0] });
        doc.text(amount, colX[1], y, { width: colWidths[1], align: 'right' });

        y += 20;
        doc.strokeColor(colors.border).moveTo(40, y).lineTo(555, y).stroke();
        y += 15;
    };

    drawRow(`Cycle Dues (Base Amount: ₹${amount})`, `₹${pendingAmount}`);

    y += 10;
    drawRow('TOTAL PENDING', `₹${pendingAmount}`, true);

    y += 30;

    const footerY = y;

    if (pendingAmount <= 0) {
        doc.save();
        doc.rotate(-15, { origin: [300, 400] });
        doc.opacity(0.1);
        doc.fontSize(120).fillColor(colors.success).text('PAID', 150, 400, { align: 'center' });
        doc.restore();

        doc.rect(50, footerY, 495, 60).fill('#ECFDF5');
        doc.fillColor('#065F46').fontSize(12).font('Helvetica-Bold')
            .text('NO OUTSTANDING DUES', 70, footerY + 15);
    } else {
        doc.rect(50, footerY, 495, 90).fill('#EFF6FF');
        doc.fillColor('#1E40AF').fontSize(12).font('Helvetica-Bold')
            .text('PAYMENT OPTIONS', 70, footerY + 15);

        doc.fontSize(10).font('Helvetica').fillColor('#1E3A8A')
            .text(`UPI ID: ${upiId}`, 70, footerY + 35)
            .text(`Payee: ${payeeName}`, 300, footerY + 35);

        doc.fillColor(colors.accent)
            .text('Click here to Pay Now', 70, footerY + 55, { link: upiLink, underline: true });

        doc.fontSize(8).fillColor(colors.textLight)
            .text(`Please verify the payee name "${payeeName}" before proceeding.`, 70, footerY + 75);
    }

    doc.end();
});

module.exports = { getBills, updateBillStatus, downloadBillPDF };